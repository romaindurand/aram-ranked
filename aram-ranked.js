const User = require('./lib/User')
const parsing = require('./lib/parsing')
const request = require('request-promise')
const {TotalUsersNotFoundError} = require('./lib/errors')

class AramRanked {
  constructor (server) {
    if (!server) throw new Error('You need to specify a server (see docs)')
    server = server.toLowerCase()
    if (!AramRanked.getServers()[server]) throw new Error('You need to specify a valid server (see docs)')
    this.server = server
    this.rankingUrl = `http://www.aram-ranked.info/${server}/statistics/ranking`
  }

  static getServers () {
    return {
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
    }
  }

  getTotalUsers () {
    return request(this.rankingUrl).then((html) => {
      const totalUsers = parsing.extractTotalUsers(html)
      if (!totalUsers) throw new TotalUsersNotFoundError()
      return totalUsers
    })
  }

  getUserByName (username) {
    return new User(this.server, username)
  }
}

module.exports = AramRanked
