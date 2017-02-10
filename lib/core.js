const request = require('request-promise')
const parsing = require('./parsing')
const utils = require('./utils')
const {AuthTokenNotFoundError} = require('./errors')

module.exports = {
  // TODO: some stuff from User.js could be here
  getUserPageWithAuth ({authToken, authCookie, server, homeUrl, username}) {
    const j = request.jar()
    const cookie = request.cookie(`${utils.authCookieName}=${authCookie}`)
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
        return Promise.reject(error)
      })
  },

  getAuthConf ({html, response}) {
    const authToken = parsing.extractAuthToken(html)
    if (!authToken) throw new AuthTokenNotFoundError()
    const cookies = response.headers['set-cookie']
    const unparsedCookie = cookies.find((cookie) => cookie.indexOf(utils.authCookieName) === 0)
    const authCookie = parsing.extractAuthCookie(unparsedCookie)
    return {authCookie, authToken}
  },

  handleRedirect (error) {
    if (error.statusCode === 302) {
      return this.getPageByUrl(error.response.headers.location)
    }
  },

  getPageByUrl (url) {
    return request(url).then((html) => {
      return {html, url}
    }).catch(error => {
      return Promise.reject(error)
    })
  }
}
