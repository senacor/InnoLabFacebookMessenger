const request = require('request')
const objectPath = require('object-path')

exports.handler = (event, context, callback) => {
    const {fb_access_token, request_body} = event

    if(!fb_access_token) {
        return callback(new Error('You have to provide a Facebook access token'))
    }

    request({
        uri: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: fb_access_token },
        method: "POST",
        json: request_body
    }, (err, res) => {
        if (err) {
            console.error(`Unable to send message: ${JSON.stringify(err)}`)
            return callback(err)
        } else if (objectPath.get(res, 'body.error')) {
            console.log(objectPath.get(res, 'body.error'))
            return callback(new Error(JSON.stringify(objectPath.get(res, 'body.error'))))
        }

        console.log('message sent!')
        return callback()
    })
}