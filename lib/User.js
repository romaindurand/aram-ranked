const parsing = require('./parsing')
const core = require('./core')
const request = require('request-promise')
const {EmptyUsernameError, UserNotFoundError, EmptyServerError} = require('./errors')

class User {
  constructor (server, username) {
    if (!server) return Promise.reject(new EmptyServerError())
    if (typeof server === 'object') {
      const userConf = server
      return this.mergeUserConf(userConf)
    }
    if (!username) return Promise.reject(new EmptyUsernameError())
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
        this.rankingUrl = userConf.rankingUrl
        return userConf
      })
      .then(this.getRanking.bind(this))
      .then(this.mergeUserConf.bind(this))
  }

  mergeUserConf (userConf) {
    Object.assign(this, userConf)
    return this
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
      .then(this.getRanking.bind(this))
      .then(userConf => {
        userConf.refreshed = this.getUserRefreshDiff(userConf)
        return this.mergeUserConf(userConf)
      })
  }

  getUserRefreshDiff (newUserConf) {
    const diff = [];
    ['lastGame', 'ranking', 'rating'].forEach(key => {
      if (newUserConf[key] === this[key]) return
      const keyDiff = {key}
      if (key === 'ranking') {
        keyDiff.value = this.ranking - newUserConf.ranking
      }
      if (key === 'rating') {
        keyDiff.value = newUserConf.rating - this.rating
      }
      diff.push(keyDiff)
    })
    if (!diff.length) return false
    return diff
  }

  getRanking (userConf) {
    this.rankingUrl = this.rankingUrl || userConf.rankingUrl
    return request(this.rankingUrl).then(html => {
      const $ = core.getWindow(html)
      const row = $('#active-row td')
        .map((idx, el) => $(el).text())
      userConf.ranking = row[0]
      return userConf
    })
  }
}

module.exports = User
