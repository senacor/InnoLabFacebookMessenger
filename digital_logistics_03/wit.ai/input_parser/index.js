const botBuilder = require('claudia-bot-builder')
const objectPath = require('object-path')
const aws = require('aws-sdk')
const ApiBuilder = require('claudia-api-builder')
const DOC = require('dynamodb-doc')

aws.config.update({region: 'eu-central-1'})
const lambda = new aws.Lambda({
    region: 'eu-central-1'
})

const docClient = new DOC.DynamoDB()

/**
 * Extracts a 8 digit number out of a string
 * @param {String} msg 
 * @return String
 */
const extractParcelId = msg => msg.match(/(\d{8})\D*/)[1]

/**
 * Creates or updates a session in db, psid is unique key!
 * @param {String|Number} sender Facebook page scoped user id
 * @param {String|Nunber} parcelId 8 digit parcel id
 * @return Promise once data is put to db
 */
const upsertSession = (sender, parcelId) => new Promise((resolve, reject) => {
    const params = {
        TableName: 'wit_ai_contexts',
        Item: {
            psid: String(sender),
            parcelId: String(parcelId)
        }
    }

    docClient.putItem(params, err => {
        if(err) {
            return reject(err)
        }

        return resolve()
    })
})

/**
 * Invokes another lambdas
 * @param {String} lambda name of the lambda you want to invoke
 * @param {Object} msg JSON message you want to send your lambda
 * @return Promise once lambda got invoked (does not wait for lambda to return)
 */
const invokeLambda = (lambda, msg = {}) => new Promise((resolve, reject) => {
    lambda.invoke({
        FunctionName: lambda,
        Payload: JSON.stringify(msg),
        InvocationType: 'Event'
    }, (err, data) => {
        if (err) {
            return reject(err)
        }

        return resolve()
    })
})

module.exports = botBuilder(request => {
    const sender = objectPath.get(request, 'sender', '')

    // TODO handle messages without parcel ids
    return upsertSession(sender, extractParcelId(request.text))
        .then(() => invokeLambda('digital_logistics_03-wit_ai-msf_sender'), {msg: 'Hello World', sender})
}, {platforms: ['facebook']})