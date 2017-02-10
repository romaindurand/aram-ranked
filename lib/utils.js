const Zepto = require('zepto-node')
const domino = require('domino')

module.exports = {
  authCookieName: '_ARAMTracker_session',

  getWindow (html) {
    const srcRegex = /src=/gi
    html = html.replace(srcRegex, 'data-src=')
    const window = domino.createWindow(html)
    return Zepto(window)
  },

  getHtmlAndResponse (body, response, error) {
    if (error) throw error
    return {html: body, response}
  }
}
