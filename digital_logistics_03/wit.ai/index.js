const botBuilder = require('claudia-bot-builder')

module.exports = botBuilder(request => {
    return 'Hello World'
}, {platforms: ['facebook']})
