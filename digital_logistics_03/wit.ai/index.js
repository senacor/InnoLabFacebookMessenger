const botBuilder = require('claudia-bot-builder')

module.exports = botBuilder(request => {
    return 'Hello World ' + JSON.stringify(request.originalRequest.message.nlp) + ' ENDE'
}, {platforms: ['facebook']})
