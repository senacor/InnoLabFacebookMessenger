const botBuilder = require('claudia-bot-builder');

module.exports = botBuilder(
	request => `Thanks for sending ${request.text}. Your message is very important to us!`, 
	{platforms: ['facebook']}
)