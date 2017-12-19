console.log('db1')
const aws = require('aws-sdk')
const DOC = require('dynamodb-doc')
const objectPath = require('object-path')

aws.config.update({region: 'eu-central-1'})
const docClient = new DOC.DynamoDB()

const db = {
    /**
     * Takes multiple parcel ids and returns each db entries
     * @param ids defaults to empty array, expects list of parcel ids as strings or number
     * @returns Promise.<{{String: {Object}}}> resolves with object, where key is parcel id and value is db's parcel item entry
     */
    getParcels: (ids = []) => new Promise((resolve, reject) => {
        // Make sure it's an array, not only a string
        ids = [].concat(ids)

        if (ids.length > 100) {
            return reject(new Error('Cannot retrieve more then 100 parcels a time'))
        }

        if (ids.length <= 0){
            return reject(new Error('No ids passed'))
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
                console.log(err)
                return reject(err)
            }

            const parcels = {}
            objectPath.get(data, 'Responses.digital_logistics_parcel', []).forEach(parcel => {
                if (parcel.parcel_customer_id) {
                    parcels[parcel.parcel_id] = parcel
                }
            })

            return resolve(parcels)
        })
    }),
    /**
     * Returns a single user, queried by fb psid
     * @param {String} psid 
     * @returns Promise.<{Object}> user from db
     */
    getUserByPsid: psid => new Promise((resolve, reject) => {
        console.log(`Evaluate login status for psid ${psid}`)
        const scan = {
            TableName: 'digital_logistics_customer',
            ExpressionAttributeValues: {
                ':fb_psid': psid
            },
            FilterExpression: 'fb_psid = :fb_psid'
        }

        docClient.scan(scan, (err, data) => {
            if (err) {
                console.log(err)
                return reject(err)
            }

            console.log(data)
            const users = data.Items

            if (users.length !== 1) {
                return reject(new Error(`Unexpected amount (${users.length}) of users for psid code ${psid}`))
            }

            return resolve(users[0])
        })
    }),
    /**
     * Returns status for being logged in or logged out, evaluated by psid
     * @param {string} psid page scoped facebook user id
     * @returns Promise.<{String}> resolves with a string, representing the status
     */
    getLoginStatus: psid => db.getUserByPsid(psid)
        .then(() => db.STATI.LOGGED_IN)
        .catch(() => db.STATI.LOGGED_OUT),
    
    STATI: {
        LOGGED_IN: 'loggedIn',
        LOGGED_OUT: 'loggedOut'
    }
}

module.exports = db
