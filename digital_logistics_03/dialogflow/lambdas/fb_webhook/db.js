const aws = require('aws-sdk')
const DOC = require('dynamodb-doc')

aws.config.update({region: 'eu-central-1'})
const docClient = new DOC.DynamoDB()

const db = {
    /**
     * Returns a single user, queried by fb psid
     * @param {String} psid 
     * @returns Promise.<{Object}> user from db
     */
    getUserByPsid: psid => new Promise((resolve, reject) => {
        const scan = {
            TableName: 'digital_logistics_customer',
            ExpressionAttributeValues: {
                ':fb_psid': psid
            },
            FilterExpression: 'fb_psid = :fb_psid'
        }

        docClient.scan(scan, (err, data) => {
            if (err) {
                return reject(err)
            }

            const users = data.Items

            if (users.length !== 1) {
                return reject(new Error(`Unexpected amount (${users.length}) of users for psid code ${psid}`))
            }

            return resolve(users[0])
        })
    }),

    /**
     * Sets psid and auth code in db to given values
     * @param {Object} user 
     * @param {String} user.email part of DynamoDB Primary Key
     * @param {String} user.customer_id part of DynamoDB Primary Key
     * @returns Promise.<{Object}> resolves with an object of all new user's attributes
     */
    setPsid: (user, psid) => new Promise((resolve, reject) => {
        const update = {
            TableName: 'digital_logistics_customer',
            Key: {
                'email': user.email,
                'customer_id': user.customer_id
            },
            UpdateExpression: 'set fb_psid = :f',
            ExpressionAttributeValues: {
                ':f': psid
            },
            ReturnValues: 'ALL_NEW'
        }

        docClient.updateItem(update, (err, data) => {
            if (err) {
                return reject(err)
            }

            return resolve(data)
        })
    }),
    
    /**
     * Returns a single user, queried by authorization code
     * @param {String} authCode 
     * @returns Promise.<{Object}> user from db
     */
    getUserByAuthorizationCode: authCode => new Promise((resolve, reject) => {
        const query = {
            TableName: 'digital_logistics_customer',
            ExpressionAttributeValues: {
                ':authorization_code': authCode
            },
            FilterExpression: 'authorization_code = :authorization_code'
        }

        docClient.scan(query, (err, data) => {
            if (err) {
                return reject(err)
            }

            const users = data.Items

            if (users.length !== 1) {
                return reject(new Error(`Unexpected amount (${users.length}) of users for auth code ${authCode}`))
            }

            return resolve(users[0])
        })
    }),

    /**
     * This function removes a given field at digital_logistics_customer for a given user
     * @param {Object} user user object containing at least email and customer_id
     * @param {String} user.email part of DynamoDB Primary Key
     * @param {String} user.customer_id part of DynamoDB Primary Key
     * @param {String} field field to remove in db
     */
    removeFieldInDb: (user, field) => new Promise((resolve, reject) => {
        const remove = {
            TableName: 'digital_logistics_customer',
            Key: {
                'email': user.email,
                'customer_id': user.customer_id
            },
            UpdateExpression: `remove ${field}`
        }

        docClient.updateItem(remove, (err, data) => {
            if (err) {
                return reject(err)
            }

            return resolve(data)
        })
    })
}

module.exports = db
