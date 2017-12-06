const botBuilder = require('claudia-bot-builder')
const {fbTemplate} = require('claudia-bot-builder')
const objectPath = require('object-path')
const AWS = require('aws-sdk')
const DOC = require('dynamodb-doc')

AWS.config.update({region: 'eu-central-1'})
const docClient = new DOC.DynamoDB()

const STATI = {
  LOGGED_ID: 'loggedIn',
  LOGGED_OUT: 'loggedOut'
}

/**
 * Returns a single user, queried by authorization code
 * @param {String} authCode 
 * @returns Promise.<{Object}> user from db
 */
const getUserByAuthorizationCode = authCode => new Promise((resolve, reject) => {
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
})

/**
 * Returns a single user, queried by fb psid
 * @param {String} psid 
 * @returns Promise.<{Object}> user from db
 */
const getUserByPsid = psid => new Promise((resolve, reject) => {
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
})

/**
 * Sets psid and auth code in db to given values
 * @param {Object} user 
 * @returns Promise.<{Object}> resolves with an object of all new user's attributes
 */
const setPsidAndAuthCode = user => new Promise((resolve, reject) => {
  const update = {
    TableName: 'digital_logistics_customer',
    Key: {
      'email': user.email,
      'customer_id': user.customer_id
    },
    UpdateExpression: 'set authorization_code = :r, fb_psid = :f',
    ExpressionAttributeValues: {
      ':r': user.authorization_code,
      ':f': user.fb_psid
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
 * This function removes a given field at digital_logistics_customer for a given user
 * @param {Object} user user object containing at least email and customer_id
 * @param {*} field field to remove in db
 */
const removeFieldInDb = (user, field) => new Promise((resolve, reject) => {
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

/**
 * Returns status for being logged in or logged out, evaluated by psid
 * @param {string} psid page scoped facebook user id
 * @returns Promise.<{String}> resolves with a string, representing the status
 */
const getLoginStatus = psid => getUserByPsid(psid)
  .then(() => STATI.LOGGED_IN)
  .catch(() => STATI.LOGGED_OUT)

module.exports = botBuilder(request => {
  if (objectPath.has(request, 'originalRequest.message')) {
    const message = objectPath.get(request, 'originalRequest.message.text')

    if (message.includes('login')) {
      return getLoginStatus(objectPath.get(request, 'originalRequest.sender.id'))
        .then(status => {
          if (status === STATI.LOGGED_IN) {
            return 'Sorry dude, you already are logged in!'
          }

          return new fbTemplate.Button('Login because bla bla bla')
            .addLoginButton('https://s3.eu-central-1.amazonaws.com/digital-logistic-web/login.html')
            .get()
        })
    } else if (message.includes('logout')) {
      return getLoginStatus(objectPath.get(request, 'originalRequest.sender.id'))
        .then(status => {
          if (status === STATI.LOGGED_OUT) {
            return 'Sorry dude, you already are logged out!'
          }

          return new fbTemplate.Button('Logout because blu blu blu')
            .addLogoutButton()
            .get()
        })
    } else {
      return Promise.resolve('Hi there')
    }
  } else if (objectPath.has(request, 'originalRequest.account_linking') && objectPath.get(request, 'originalRequest.account_linking.status') === 'linked') {
    console.log('Received linking event:', JSON.stringify(request))

    const authCode = objectPath.get(request, 'originalRequest.account_linking.authorization_code')
    if (!authCode || authCode === '') {
      console.log('No or empty auth code provided!')
      return Promise.reject()
    }

    return getUserByAuthorizationCode(authCode)
      .then(user => {
        user.fb_psid = objectPath.get(request, 'originalRequest.sender.id')

        return user
      })
      .then(user => setPsidAndAuthCode(user).then(() => user))
      .then(user => removeFieldInDb(user, 'authorization_code'))
      .then(() => null) // Return nothing
  } else if (objectPath.has(request, 'originalRequest.account_linking') && objectPath.get(request, 'originalRequest.account_linking.status') === 'unlinked') {
    return getUserByPsid(objectPath.get(request, 'originalRequest.sender.id'))
      .then(user => removeFieldInDb(user, 'fb_psid'))
      .then(() => null) // Return nothing
  } else {
    console.log('Unexpected event')
    return Promise.reject()
  }
}, {platforms: ['facebook']})
