const request = require('request')
const objectPath = require('object-path')

module.exports = {
  /**
   * Sends message to user as defined in requestBody via app, identified by fbAccessToken
   * @param {String} fbAccessToken
   * @param {Object} requestBody
   * @returns Promise
   */
  send: (fbAccessToken, requestBody) => new Promise((resolve, reject) => {
    if (!fbAccessToken) {
      return reject(new Error('You have to provide a Facebook access token'))
    }

    request({
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: fbAccessToken },
      method: 'POST',
      json: requestBody
    }, (err, res) => {
      if (err) {
        console.error(`Unable to send message: ${JSON.stringify(err)}`)
        return reject(err)
      } else if (objectPath.get(res, 'body.error')) {
        console.log(objectPath.get(res, 'body.error'))
        return reject(new Error(JSON.stringify(objectPath.get(res, 'body.error'))))
      }

      console.log('message sent!')
      return resolve()
    })
  })
}
