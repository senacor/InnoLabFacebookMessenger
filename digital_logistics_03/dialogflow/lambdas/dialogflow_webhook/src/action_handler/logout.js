const objectPath = require('object-path')
const botBuilder = require('claudia-bot-builder')
const checkShouldSuppress = require('../helper_functions/checkShouldSuppress')
const db = require('../db')

const fbTemplate = botBuilder.fbTemplate

/**
 * This endpoint provides a logout button, if the user is currently logged in
 * @param {Object} req http request object
 * @param {Object} api claudia api object
 * @returns Promise.<{Object}> resolves with a claudia api response, which returns a JSON to the client
 */
module.exports = (req, api) => new Promise((resolve) => {
    console.log('Enter logout action handler')
    if (checkShouldSuppress(req)) {
        if (objectPath.get(req, 'body.originalRequest.source') === 'facebook') {
            console.log('Logout action via facebook messenger')
            return resolve(db.getLoginStatus(objectPath.get(req, 'body.originalRequest.data.sender.id'))
                .then(status => {
                    if (status === db.STATI.LOGGED_OUT) {
                        console.log('Currently not logged in')
                        return {
                            speech: 'Du bist zur Zeit nicht eingeloggt.',
                            displayText: 'Du bist zur Zeit nicht eingeloggt.'
                        }
                    }

                    console.log('Currently logged in')
                    return {
                        data: {
                            facebook: 
                                new fbTemplate.Button('Account Verknüpfung mit Digital Logistics aufheben.')
                                    .addLogoutButton()
                                    .get()
                        
                        }
                    }
                })
                .then(result => 
                    new api.ApiResponse(result, {'Content-Type': 'application/json'}, 200)
                )
            )
        } else {
            console.log('Logout action via non-facebook messenger')
            return resolve(new api.ApiResponse({
                speech: 'Die Login-Funktionalität steht nur über den Facebook Messenger zur Verfügung.',
                displayText: 'Die Login-Funktionalität steht nur über den Facebook Messenger zur Verfügung.'
            },
            {'Content-Type': 'application/json'}, 200))
        }
    }
}).then(result => {
    console.log('Leave logout action handler')
    return result
})
