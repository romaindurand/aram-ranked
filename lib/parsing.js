const utils = require('./utils')
const siteRoot = 'http://www.aram-ranked.info'
const welcomeMessage = 'Welcome To ARAM Ranked'

module.exports = {
  extractUserConf (html) {
    const user = {}
    const $ = utils.getWindow(html)
    const usernameNode = $('dd').get(0)
    const ratingNode = $('dd').get(2)
    user.lastGame = $('#recent tr:first-child td:first-child').text()
    user.refreshUrl = siteRoot + $($('.btn.btn-refresh')[0]).attr('href')
    user.rankingUrl = siteRoot + $('.btn.btn-search.btn-ranking').attr('href')
    user.summonerId = user.rankingUrl.slice(user.rankingUrl.indexOf('=') + 1)
    user.summonerIcon = siteRoot + $($('img.icon_image')[0]).data('src')
    user.rating = $(ratingNode).text().trim()
    user.username = $(usernameNode).text().trim()

    return user
  },

  extractUserId (url) {
    return url.split('=')[1]
  },

  containsWelcomeMessage (html) {
    return html.indexOf(welcomeMessage) !== -1
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
  }
}
