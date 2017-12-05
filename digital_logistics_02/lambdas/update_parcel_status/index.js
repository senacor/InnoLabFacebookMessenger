'use strict'

const botBuilder = require('claudia-bot-builder')
const fbReply = require('claudia-bot-builder/lib/facebook/reply')
const AWS = require('aws-sdk')
const doc = require('dynamodb-doc')

const parse = AWS.DynamoDB.Converter.output
const dynamoDb = new doc.DynamoDB()

const fbTemplate = botBuilder.fbTemplate

console.log('Loading function')

const hasAnyStatusChanged = (oldStatus, newStatus) => 
    oldStatus.map((val, i) => val.Status !== newStatus[i].Status).some(val => val)

const findFbPsid = (customer_id) =>
    new Promise((resolve, reject) => {
        dynamoDb.query({
            ExpressionAttributeValues:  {
                ':v1': customer_id
            },
            KeyConditionExpression: 'customer_id = :v1',
            TableName: 'digital_logistics_customer'
        },
        (err, data) => {
            if (err) {
                return reject(err)
            } 
            resolve(data)
        })
    })
    

const buildStatusMessage = (parcel_id, status) =>
    new fbTemplate.List()
        .addBubble('Sendungsstatus', `Auftragsnummer: ${parcel_id}`)
        .addImage(`https://s3.eu-central-1.amazonaws.com/digital-logistic-web/01_pacel_received_${status[0].Status}.png`)
        .addBubble('Transport zum Paktezentrum', `${status[1].description}`)
        .addImage(`https://s3.eu-central-1.amazonaws.com/digital-logistic-web/02_parcel_transport_${status[1].Status}.png`)
        .addBubble('Bearbeitung im Paketzentrum', `${status[2].description}`)
        .addImage(`https://s3.eu-central-1.amazonaws.com/digital-logistic-web/03_parcel_factroy_${status[2].Status}.png`)
        .addBubble('In Zustellung', `${status[3].description}`)
        .addImage(`https://s3.eu-central-1.amazonaws.com/digital-logistic-web/04_parcel_delivery_${status[3].Status}.png`)
        .get()

const sendFacebookMessage = (parcel_id, customer, status) =>
    new Promise((resolve, reject) => {
        const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN
        if (FB_ACCESS_TOKEN === undefined) {
            console.log('Cannot send facebook message. FB_ACCESS_TOKEN not set.')
            resolve()
        } else {
            const fb_psid = customer.Items[0].fb_psid
            const customer_id = customer.Items[0].customer_id
            if (fb_psid === undefined) {
                console.log(`Customer ${customer_id} is not connected to Facebook`)
                resolve()
            } else {
                console.log(`Notifiy customer ${customer_id} via facebook psid ${fb_psid}`)
                const messages = ['Der Status eines Ihrer Pakete wurde aktualisiert!', buildStatusMessage(parcel_id, status)]
                return fbReply(fb_psid, messages, FB_ACCESS_TOKEN).catch(error => reject(error))
            }
        }
    })

exports.handler = event => {
    console.log('Received event:', JSON.stringify(event, null, 2))
    event.Records.forEach((record) => {
        if (record.eventName === 'INSERT') {
            console.log('Event INSERT. New Parcel!')
        }
        else if (record.eventName === 'MODIFY') {
            console.log('Event MODIFY. Status Update?')
            const oldStatus = parse({ 'M': record.dynamodb.OldImage }).Status
            const newStatus = parse({ 'M': record.dynamodb.NewImage }).Status
            if (hasAnyStatusChanged(oldStatus, newStatus)) {
                console.log('Status changed!')
                return findFbPsid(record.dynamodb.Keys.parcel_customer_id.S)
                    .then(data => {
                        if (!data.Items.length) {
                            console.log(`Customer not found: ${record.dynamodb.Keys.parcel_customer_id.S}`)
                        } else {
                            return sendFacebookMessage(record.dynamodb.Keys.parcel_customer_id.S, data, newStatus)
                        }
                    })
                    .catch(error => console.log('Error looking up customer: ', error))
            }
        }
    })
}
