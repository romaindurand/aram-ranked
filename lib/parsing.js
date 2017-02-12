const core = require('./core')
const {AuthTokenNotFoundError} = require('./errors')
const siteRoot = 'http://www.aram-ranked.info'

module.exports = {
  extractUserConf (html) {
    const user = {}
    const $ = core.getWindow(html)
    const usernameNode = $('dd').get(0)
    const ratingNode = $('dd').get(2)
    const lastGame = $('#recent tr:first-child td:first-child').text() || ''
    user.lastGame = lastGame.replace('\n', ' ')
    user.refreshUrl = siteRoot + $($('.btn.btn-refresh')[0]).attr('href')
    user.rankingUrl = siteRoot + $('.btn.btn-search.btn-ranking').attr('href')
    user.summonerId = user.rankingUrl.slice(user.rankingUrl.indexOf('=') + 1)
    user.summonerIcon = siteRoot + $($('img.icon_image')[0]).data('src')
    user.rating = $(ratingNode).text().trim()
    user.username = $(usernameNode).text().trim()
    user.isNew = this.countGames($) <= 4

    return user
  },

  countGames ($) {
    const gamesCount = $('#recent tr.row-link').length
    return gamesCount
  },

  extractUserId (url) {
    return parseInt(url.split('=')[1], 10)
  },

  isHomePage (html) {
    const homepageRegexp = /<title>ARAM ranked<\/title>/g
    return !!homepageRegexp.exec(html)
  },

  extractAuthToken (html) {
    const tokenRegexp = /name="authenticity_token" value="([a-zA-Z0-9/+-=]*)"/g
    const match = tokenRegexp.exec(html)
    if (!match) return
    return match[1]
  },

  extractAuthCookie (cookie) {
    return cookie.split('=')[1].split(';')[0]
  },

  extractTotalUsers (html) {
    const totalUsersRegex = /rating ranking of ([0-9]*) summoners/g
    const match = totalUsersRegex.exec(html)
    if (!match) return
    return match[1]
  },

  getAuthConf ({html, response}) {
    const authToken = this.extractAuthToken(html)
    if (!authToken) throw new AuthTokenNotFoundError()
    const cookies = response.headers['set-cookie']
    const unparsedCookie = cookies.find((cookie) => cookie.indexOf(core.authCookieName) === 0)
    const authCookie = this.extractAuthCookie(unparsedCookie)
    return {authCookie, authToken}
  }
}
