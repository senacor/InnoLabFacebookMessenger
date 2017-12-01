const botBuilder = require('claudia-bot-builder')
const {fbTemplate} = require('claudia-bot-builder')

module.exports = botBuilder(function (request) {
    // TODO check if it is an login request or message request request
    return new fbTemplate.Button('get removed')
    .addLoginButton('https://s3.eu-central-1.amazonaws.com/digital-logistic-web/index.html')
    .get()
}, {platforms: ['facebook']})