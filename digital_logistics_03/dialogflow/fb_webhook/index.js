const objectPath = require('object-path')
const requestHttp = require('request')
require('request-debug')(requestHttp)
const ApiBuilder = require('claudia-api-builder')
const api = new ApiBuilder({mergeVars: true})
const db = require('./db')


const linkAccount = request => {
    console.log('Received linking event:', JSON.stringify(request))
    
    const authCode = objectPath.get(request, 'account_linking.authorization_code')
    if (!authCode || authCode === '') {
        console.log('No or empty auth code provided!')
        return Promise.reject()
    }
    
    return db.getUserByAuthorizationCode(authCode)
        .then(user => {
            user.fb_psid = objectPath.get(request, 'sender.id')
    
            return user
        })
        .then(user => db.setPsidAndAuthCode(user).then(() => user))
        .then(user => db.removeFieldInDb(user, 'authorization_code'))
        .then(() => null) // Return nothing
}

const unlinkAccount = request => {
    return db.getUserByPsid(objectPath.get(request, 'sender.id'))
        .then(user => db.removeFieldInDb(user, 'fb_psid'))
        .then(() => null) // Return nothing
}

const facebookEventHandler = req => {
    console.log('running facebookEventHandler')
    console.log(req)

    const tasks = objectPath.get(req, 'body.entry', []).map(entry => {
        const messageTask = entry.messaging.map(messaging => {
            // 1) Standard message sent by the user
            if (messaging.message) {
                return new Promise(resolve => {
                // Better catch both you never know. 
                // May the devil with those who use other capitalization. 
                    delete req.headers.Host
                    delete req.headers.host

                    requestHttp.post(objectPath.get(req, 'env.dialogflow_webhook'), 
                        {
                            headers: req.headers,
                            body: JSON.stringify(req.body)
                        },
                        () => { resolve() })
                })
            // 2) Event sent by Facebook after account linking
            } else if ( objectPath.get(messaging, 'account_linking.status') === 'linked') {
                return linkAccount(messaging)
            // 3) Event sent by Facebook after account unlinking
            } else if ( objectPath.get(messaging, 'account_linking.status') === 'unlinked') {
                return unlinkAccount(messaging)
            // 4) Anything else we don't care about
            } else {
                console.log(`Don't know what to do with object ${messaging}`)
                return Promise.reject()
            }
        })
        return Promise.all(messageTask)
    })
    return Promise.all(tasks)
}

const initialFacebookConnectionHandler = req => {
    console.log('running initialFacebookConnectionHandler')

    if (objectPath.get(req, ['queryString', 'hub.verify_token']) === objectPath.get(req, 'env.facebook_verify_token')) {
        console.log('Passed validation')
        return parseInt(req.queryString['hub.challenge'])
    }

    console.log('Did not passed validation')
    return new api.ApiResponse('Did not passed validation', {'Content-Type': 'text/plain'}, 400)
}

api.post('/webhook', facebookEventHandler)
api.get('/webhook', initialFacebookConnectionHandler)

module.exports = api