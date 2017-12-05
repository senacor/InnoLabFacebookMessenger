const dynamo = require('dynamodb')
const Joi = require('joi')

module.exports = dynamo.define('Event', {
    hashKey: 'email',
    schema: {
        customer_id: Joi.number(),
        email: Joi.string().email(),
        LastName: Joi.string(),
        Name: Joi.string(),
        fb_email: Joi.string().email(),
        fb_psid: Joi.number(),
        password: Joi.string(),
        authorizationCode: {
            code: Joi.number(),
            ts: Joi.number()
        }
    },
    tableName: 'digital_logistics_customer'
})