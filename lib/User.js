const parsing = require('./parsing')
const utils = require('./utils')
const core = require('./core')
const request = require('request-promise')
const {EmptyUsernameError, UserNotFoundError} = require('./errors')

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
      transform: utils.getHtmlAndResponse
    })
      .then(core.getAuthConf)
      .then(this.getUserPageWithAuth.bind(this))
      .then(this.createUserConf.bind(this))
      .then(userConf => Object.assign(this, userConf))
      .catch(error => {
        return Promise.reject(error)
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
    userConf.isNew = parsing.containsWelcomeMessage(html)
    return userConf
  }

  getUserPageWithAuth ({authToken, authCookie}) {
    return core.getUserPageWithAuth({
      authToken,
      authCookie,
      server: this.server,
      homeUrl: this.homeUrl,
      username: this.username
    })
  }

  refreshData () {
    return request({
      uri: this.refreshUrl,
      transform: utils.getHtmlAndResponse
    }).then(this.createUserConf.bind(this))
      .then(userConf => {
        return this.getRanking()
          .then((ranking) => {
            return {ranking, userConf, oldConf: this}
          })
          // todo
      })
  }

  getRanking () {
    return request(this.rankingUrl).then((html) => {
      const $ = utils.getWindow(html)
      const row = $('#active-row td')
        .map((idx, el) => $(el).text())
      return row[0]
    }).catch(error => {
      return Promise.reject(error)
    })
  }
}

module.exports = User
