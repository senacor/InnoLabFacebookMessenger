console.log('db1')
const aws = require('aws-sdk')
console.log('db11')
const DOC = require('dynamodb-doc')
console.log('db12')
const objectPath = require('object-path')
console.log('db2')

aws.config.update({region: 'eu-central-1'})
const docClient = new DOC.DynamoDB()
console.log('db3')

const db = {
    getParcels: (ids = []) => new Promise((resolve, reject) => {
        // Make sure it's an array, not only a string
        ids = [].concat(ids)

        if (ids.length > 100) {
            return reject(new Error('Cannot retrieve more then 100 parcels a time'))
        }

        const param = {
            RequestItems: {
                'digital_logistics_parcel': {
                    Keys: ids.map(id => ({parcel_id: String(id)}))
                }
            }
        }

        docClient.batchGetItem(param, (err, data) => {
            if (err) {
                return reject(err)
            }

            return resolve(objectPath.get(data, 'Responses.digital_logistics_parcel', []))
        })
    })
}

module.exports = db
