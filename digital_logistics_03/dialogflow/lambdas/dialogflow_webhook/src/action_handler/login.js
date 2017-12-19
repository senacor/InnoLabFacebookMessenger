const objectPath = require('object-path')
const botBuilder = require('claudia-bot-builder')
const checkShouldSuppress = require('../helper_functions/checkShouldSuppress')
const db = require('../db')

const fbTemplate = botBuilder.fbTemplate

/**
 * This endpoint provides a login button, if the user is not already logged in
 * @param {Object} req http request object
 * @param {Object} api claudia api object
 * @returns Promise.<{Object}> resolves with a claudia api response, which returns a JSON to the client
 */
module.exports = (req, api) => new Promise((resolve) => {
    console.log('Enter login action handler')
    if (checkShouldSuppress(req)) {
        if (objectPath.get(req, 'body.originalRequest.source') === 'facebook') {
            console.log('Login action via facebook messenger')
            return resolve(db.getLoginStatus(objectPath.get(req, 'body.originalRequest.data.sender.id'))
                .then(status => {
                    if (status === db.STATI.LOGGED_IN) {
                        console.log('Already logged in')
                        return {
                            speech: 'Du bist schon eingeloggt.',
                            displayText: 'Du bist schon eingeloggt.'
                        }
                    }

                    console.log('Not yet logged in')
                    return {
                        data: {
                            facebook: 
                                new fbTemplate.Button('Verknüpfe deinen Digital Logistics Account')
                                    .addLoginButton('https://s3.eu-central-1.amazonaws.com/digital-logistic-web/login.html')
                                    .get()
                        
                        }
                    }
                })
                .then(result => 
                    new api.ApiResponse(result, {'Content-Type': 'application/json'}, 200)
                )
            )
        } else {
            console.log('Login action via non-facebook messenger')
            return resolve(new api.ApiResponse({
                speech: 'Ein Login ist nur über den Facebook Messenger möglich.',
                displayText: 'Ein Login ist nur über den Facebook Messenger möglich.'
            },
            {'Content-Type': 'application/json'}, 200))
        }
    }
}).then(result => {
    console.log('Leave login action handler')
    return result
})
