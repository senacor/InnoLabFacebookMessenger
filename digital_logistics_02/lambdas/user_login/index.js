const ApiBuilder = require('claudia-api-builder')
const objectPath = require('object-path')
const AWS = require('aws-sdk')
const DOC = require('dynamodb-doc')

AWS.config.update({region: 'eu-central-1'})

const api = new ApiBuilder({mergeVars: true})
const docClient = new DOC.DynamoDB()

/**
 * Finds user from our dynamo db by email
 * Rejects if no or to many users found or if db returns error
 * @param {String} email 
 * @returns Promise.<{Object}> resolves with user
 */
const findUser = email => new Promise((resolve, reject) => {
  const query = {
    TableName: 'digital_logistics_customer',
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :hkey',
    ExpressionAttributeValues: {
      ':hkey': email
    }
  }

  docClient.query(query, (err, data) => {
    if (err) {
      return reject(err)
    }

    const users = data.Items

    if (users.length !== 1) {
      return reject(`Unexpected amount (${users.length}) of users for email ${email}`)
    }

    return resolve(users[0])
  })
})

/**
 * Generates random 10 sized string and saves it to as authorization_code to our dynamo db
 * @param {Object} user 
 * @returns Promise.<{Object}> resolves with an object containing all user's attributes
 */
const setAuthCode = user => new Promise((resolve, reject) => {
  const update = {
    TableName: 'digital_logistics_customer',
    Key: {
      'email': user.email,
      'customer_id': user.customer_id
    },
    UpdateExpression: 'set authorization_code = :r',
    ExpressionAttributeValues: {
      ':r': [...Array(10)].map(() => Math.random().toString(36)[3]).join('') // 10 random chars: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    },
    ReturnValues: 'ALL_NEW'
  }

  docClient.updateItem(update, (err, data) => {
    if (err) {
      return reject(err)
    }

    return resolve(data)
  })
})

/**
 * Finds user by request data; checks pw; creates and saves auth code and returns with auth code
 * @param {Object} req HTTP request object
 * @returns Promise.<{{authorizationCode: String}|{error: String}}> resolves with an object containing the authorization code or an error message
 */
const requestHandler = req => {
  let data
  try {
    data = JSON.parse(req.body)
  } catch (e) {
    return JSON.stringify({error: 'Could not parse payload'})
  }

  return findUser(data.email)
    .then(user => {
      if (user.password !== data.password) {
        throw new Error('Password incorrect')
      }
      return user
    })
    .then(user => setAuthCode(user))
    .then(updateResult => ({authorizationCode: objectPath.get(updateResult, 'Attributes.authorization_code')}))
    .catch(err => {
      console.log(err)
      return {error: 'Could not login'}
    })
    .then(msg => JSON.stringify(msg))
}

api.post('/', req => requestHandler(req))
module.exports = api
