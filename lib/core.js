const Zepto = require('zepto-node')
const domino = require('domino')
const request = require('request-promise')

module.exports = {
  authCookieName: '_ARAMTracker_session',

  servers: {
    euw: 'EU West',
    na: 'North America',
    kr: 'Korea',
    eune: 'EU North&amp;East',
    ja: 'Japan',
    ru: 'Russia',
    tr: 'Turky',
    br: 'Brazil',
    oce: 'Oceania',
    las: 'LAS',
    lan: 'LAN'
  },

  getUserPageWithAuth ({authToken, authCookie, server, homeUrl, username}) {
    const j = request.jar()
    const cookie = request.cookie(`${this.authCookieName}=${authCookie}`)
    j.setCookie(cookie, homeUrl)
    return request({
      method: 'POST',
      uri: `http://www.aram-ranked.info/${server}/statistics/submit`,
      form: {
        authenticity_token: authToken,
        summoner_name: username
      },
      jar: j
    }).catch(this.handleRedirect.bind(this))
      .catch(error => {
        throw error
      })
  },

  handleRedirect (error) {
    if (error.statusCode === 302) {
      return this.getPageByUrl(error.response.headers.location)
    }
  },

  getPageByUrl (url) {
    return request(url).then(html => {
      return {html, url}
    }).catch(error => {
      throw error
    })
  },

  getWindow (html) {
    const srcRegex = /src=/gi
    html = html.replace(srcRegex, 'data-src=')
    const window = domino.createWindow(html)
    return Zepto(window)
  },

  getHtmlAndResponse (url) {
    return request({
      uri: url,
      transform: (body, response, error) => {
        if (error) throw error
        return {html: body, response}
      }
    })
  }
}
