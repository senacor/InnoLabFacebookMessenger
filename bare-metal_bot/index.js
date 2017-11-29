const ApiBuilder = require('claudia-api-builder')
const request = require('request')
const objectPath = require('object-path')
const crypto = require('crypto')
const tsscmp = require('tsscmp')

const api = new ApiBuilder({mergeVars: true})

/**
 * This functions send a message, defined by {@see response} to a certain user {@see sender_psid} 
 * @param {Number|String} sender_psid Facebook user id
 * @param {String} response The text send to the Facebook user
 * @param {String} facebook_access_token Access token to act as facebook app
 * @returns {Promise} Resolves after Facebook request returns with or without error
 */
const _sendMessage = (sender_psid, response, facebook_access_token) => new Promise(resolve => {
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
 * Calculates hash by given algorithm and compares calculated by given signature
 * @param {String} signatureHeader Header as sent by Facebook containing hashing algorithm and hash, something like "sha1=alskjfaösekjf"
 * @param {String} secret Facebook app secret
 * @param {String} rawBody Request body to calculate hash
 */
const _checkMessageIntegrity = (signatureHeader, secret, rawBody) => {
    const [algorithm, givenSignature] = signatureHeader.split('=')
    const calculatedSignature = crypto.createHmac(algorithm, secret).update(rawBody).digest('hex')
    // Compare strings with tsscmp to prevent timing attacks: https://codahale.com/a-lesson-in-timing-attacks/
    return tsscmp(calculatedSignature, givenSignature)
}

/**
 * This HTTP event handler always resolves with the hub.challenge extracted from the request's query string, if available
 * It handles message events by parsing them and sending a message back via the FB API
 * @param {Object} req aws lambda request object
 * @returns {Promise.<Number|null>} Number being the challenger, sent in the query string at 'hub.challenge'
 */
const facebookEventHandler = req => {
    console.log('running facebookEventHandler')

    const signatureHeader = objectPath.get(req, ['headers', 'X-Hub-Signature'])
    const secret = objectPath.get(req, 'env.facebook_app_secret')
    const rawBody = req.rawBody

    if(!_checkMessageIntegrity(signatureHeader, secret, rawBody)) {
        console.log('Message integrity test failed')
        return new api.ApiResponse('Message integrity test failed', {'Content-Type': 'text/plain'}, 400)
    }

    const tasks = []
    objectPath.get(req, 'body.entry', []).forEach(entry => {
        const event = objectPath.get(entry, 'messaging.0')

        if (objectPath.get(event, 'message')) {
            const sender_psid = event.sender.id
            const response = { "text": `You sent the message: "${JSON.stringify(event.message)}".` }

            tasks.push(_sendMessage(sender_psid, response, objectPath.get(req, 'env.facebook_access_token')))
        } else {
            console.log(`UNKOWN EVENT ${entry}`)
        }
    })

    const challenge = parseInt(objectPath.get(req, 'queryString.hub.challenge'))

    if(tasks.length <= 0) {
        return challenge
    }

    return Promise.all(tasks)
        .then(() => challenge)
}

/**
 * This function get's called on the default endpoint's GET call, when the chatbot framework gets connected to Facebook via it's developer console initially
 * It verifies that the send verify token matches the given verify token
 * @param {Object} req aws lambda request object
 * @returns {Number|null} Returns a the request's hub challenge as Number or null, if the passed verify token does not match
 */
const initialFacebookConnectionHandler = req => {
    console.log('running initialFacebookConnectionHandler')

    if(objectPath.get(req, ['queryString', 'hub.verify_token']) === objectPath.get(req, 'env.facebook_verify_token')) {
        console.log('Passed validiation')
        return parseInt(req.queryString['hub.challenge'])
    }

    console.log('Did not passed validiation')
    return new api.ApiResponse('Did not passed validiation', {'Content-Type': 'text/plain'}, 400)
}

api.post('/webhook', facebookEventHandler)
api.get('/webhook', initialFacebookConnectionHandler)

module.exports = api
