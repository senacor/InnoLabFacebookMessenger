const ApiBuilder = require('claudia-api-builder')
const request = require('request')
const objectGet = require('object-get')

const api = new ApiBuilder({mergeVars: true})

/**
 * This functions send a message, defined by {@see response} to a certain user {@see sender_psid} 
 * @param {Number|String} sender_psid Facebook user id
 * @param {String} response The text send to the Facebook user
 * @param {String} facebook_access_token Access token to act as facebook app
 * @returns {Promise} Resolves after Facebook request returns with or without error
 */
const sendMessage = (sender_psid, response, facebook_access_token) => new Promise(resolve => {
    const request_body = { "recipient": { "id": sender_psid }, "message": response }

    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": facebook_access_token },
        "method": "POST",
        "json": request_body
    }, err => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }

        return resolve()
    })
})

/**
 * This HTTP event handler always resolves with the hub.challenge extracted from the request's query string, if available
 * It handles message events by parsing them and sending a message back via the FB API
 * @param {Object} req aws lambda request object
 * @returns {Promise.<Number|null>} Number being the challenger, sent in the query string at 'hub.challenge'
 */
const facebookEventHandler = req => new Promise(resolve => {
    objectGet(req, 'body.entry').forEach(entry => {
        const event = objectGet(entry, 'messaging[0]')

        let task = Promise.resolve()

        if (event.message) {
            const sender_psid = event.sender.id
            const response = { "text": `You sent the message: "${JSON.stringify(event.message)}".` }

            task = sendMessage(sender_psid, response, objectGet(req, 'env.facebook_access_token'))
        } else {
            console.log('UNKOWN EVENT')
        }

        return task.then(() => resolve(parseInt(objectGet(req, 'queryString.hub.challenge')) || null))
    })
})

/**
 * This function get's called on the default endpoint's GET call, when the chatbot framework gets connected to Facebook via it's developer console initially
 * It verifies that the send verify token matches the given verify token
 * @param {Object} req aws lambda request object
 * @returns {Number|null} Returns a the request's hub challenge as Number or null, if the passed verify token does not match
 */
const initialFacebookConnectionHandler = req => {
    if(objectGet(req, 'queryString.hub.verify_token') === objectGet(req, 'env.facebook_verify_token')) {
        console.log('Passed validiation')
        return parseInt(req.queryString['hub.challenge'])
    }

    console.log('Did not passed validiation')
    return null
}

api.post('/webhook', facebookEventHandler)
api.get('/webhook', initialFacebookConnectionHandler)

module.exports = api