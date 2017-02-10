const parsing = require('./parsing')
const utils = require('./utils')
const request = require('request-promise')
const {AuthTokenNotFoundError, EmptyUsernameError, UserNotFoundError} = require('./errors')

class User {
  constructor (server, username) {
    if (!username) return Promise.reject(new EmptyUsernameError())
    this.server = server
    this.username = username

    return this.init()
  }

  init () {
    this.homeUrl = `http://www.aram-ranked.info/${this.server}`

    return request({
      uri: this.homeUrl,
      transform: (body, response, error) => {
        if (error) throw error
        return {html: body, response}
      }
    })
      .then(this.getAuthConf)
      .then(this.getUserPageWithAuth.bind(this))
      .then(this.createUser.bind(this))
  }

  createUser ({html, url}) {
    if (parsing.isHomePage(html)) {
      throw new UserNotFoundError()
    }
    const userConf = {
      url,
      id: parsing.extractUserId(url)
    }
    Object.assign(userConf, parsing.extractUserConf(html))
    userConf.isNew = parsing.containsWelcomeMessage(html)
    Object.assign(this, userConf)
    return this
  }

  getUserPageWithAuth ({authToken, authCookie}) {
    const j = request.jar()
    const cookie = request.cookie(`${utils.authCookieName}=${authCookie}`)
    j.setCookie(cookie, this.homeUrl)
    return request({
      method: 'POST',
      uri: `http://www.aram-ranked.info/${this.server}/statistics/submit`,
      form: {
        authenticity_token: authToken,
        summoner_name: this.username
      },
      jar: j
    }).catch(this.handleRedirect.bind(this))
  }

  handleRedirect (error) {
    if (error.statusCode === 302) {
      return this.getPageByUrl(error.response.headers.location)
    }
  }

  getPageByUrl (url) {
    return request(url).then((html) => {
      return {html, url}
    })
  }

  getAuthConf ({html, response}) {
    const authToken = parsing.extractAuthToken(html)
    if (!authToken) throw new AuthTokenNotFoundError()
    const cookies = response.headers['set-cookie']
    const unparsedCookie = cookies.find((cookie) => cookie.indexOf(utils.authCookieName) === 0)
    const authCookie = parsing.extractAuthCookie(unparsedCookie)
    return {authCookie, authToken}
  }

  refreshData () {
    // return request(this.refreshUrl).then(html => {
    //   return parsing.extractUserConf({html, url: this.url})
    // })
    // TODO: should return the user object updated
  }

  getRanking () {
    return request(this.rankingUrl).then((html) => {
      const $ = utils.getWindow(html)
      const row = $('#active-row td')
        .map((idx, el) => $(el).text())
      return row[0]
    })
  }
}

module.exports = User
