const botBuilder = require('claudia-bot-builder')
const objectPath = require('object-path')
const aws = require('aws-sdk')

aws.config.update({region: 'eu-central-1'})
const lambda = new aws.Lambda()

/**
 * Invokes another lambdas
 * @param {String} lambda name of the lambda you want to invoke
 * @param {Object} msg JSON message you want to send your lambda
 * @param {Boolean} async resolve promise if lambda called or returned?
 * @return Promise once lambda got invoked (does not wait for lambda to return)
 */
const invokeLambda = (functionName, msg = {}, async = true) => new Promise((resolve, reject) => {
    lambda.invoke({
        FunctionName: functionName,
        Payload: JSON.stringify(msg),
        InvocationType: async ? 'Event' : 'RequestResponse'
    }, (err, data) => {
        if (err) {
            return reject(err)
        }

        return resolve(data)
    })
})

module.exports = botBuilder((request, originalApiBuilderRequest) => {
    const fb_access_token = objectPath.get(originalApiBuilderRequest, 'env.facebookAccessToken')
    const sender = objectPath.get(request, 'sender')

    invokeLambda('digital_logistics_03-wit_ai-msf_sender', {fb_access_token, request_body: { sender_action: 'typing_on', recipient: { id: sender } }})

    const intent = objectPath.get(request, 'originalRequest.message.nlp.entities.intent.0', '')

    return invokeLambda('digital_logistics_03-wit_ai-find_respond', {intent, msg: request.text, sender}, false)
        .then(responseData => {
            const payload = objectPath.get(responseData, 'Payload')
            const response = objectPath.get(JSON.parse(payload), 'response', '')
            const request_body = {
                messaging_type: 'RESPONSE',
                recipient: {
                    id: sender
                },
                message: {
                    text: response
                }
            }

            return invokeLambda('digital_logistics_03-wit_ai-msf_sender', {fb_access_token, request_body})
        })
}, {platforms: ['facebook']})