const parsing = require('./parsing')
const core = require('./core')
const request = require('request-promise')
const {EmptyUsernameError, UserNotFoundError, EmptyServerError} = require('./errors')

class User {
  constructor (server, username) {
    if (!username) return Promise.reject(new EmptyUsernameError())
    if (!server) return Promise.reject(new EmptyServerError())
    this.server = server
    this.username = username
    this.homeUrl = `http://www.aram-ranked.info/${this.server}`

    return this.init()
  }

  init () {
    return core.getHtmlAndResponse(this.homeUrl)
      .then(parsing.getAuthConf.bind(parsing))
      .then(this.getUserPageWithAuth.bind(this))
      .then(this.createUserConf.bind(this))
      .then(userConf => {
        Object.assign(this, userConf)
        return this
      })
      .catch(error => {
        throw error
      })
  }

  createUserConf ({html, url}) {
    if (parsing.isHomePage(html)) {
      throw new UserNotFoundError()
    }
    const userConf = {
      url,
      id: parsing.extractUserId(url)
    }
    Object.assign(userConf, parsing.extractUserConf(html))
    return userConf
  }

  getUserPageWithAuth ({authToken, authCookie}) {
    return core.getUserPageWithAuth({
      authToken,
      authCookie,
      server: this.server,
      homeUrl: this.homeUrl,
      username: this.username,
      utf8: '✓'
    })
  }

  refreshData () {
    return request(this.refreshUrl)
      .then(parsing.extractUserConf.bind(parsing))
      .then(userConf => {
        userConf.refreshed = userConf.lastGame !== this.lastGame
        Object.assign(this, userConf)
        return this
      })
  }

  getRanking () {
    return request(this.rankingUrl).then(html => {
      const $ = core.getWindow(html)
      const row = $('#active-row td')
        .map((idx, el) => $(el).text())
      return row[0]
    }).catch(error => {
      throw error
    })
  }
}

module.exports = User
