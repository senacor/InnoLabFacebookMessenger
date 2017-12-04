const botBuilder = require('claudia-bot-builder')
const {fbTemplate} = require('claudia-bot-builder')
const objectPath = require('object-path')
const aws = require('aws-sdk')

const lambda = new aws.Lambda({
    region: 'eu-central-1'
})

/**
 * Returns a promise, which gets resolved after the lambda named @param name get executed successfully.
 * @param name the lambda's name
 * @param payload JSON payload which gets passed to lambda
 * @returns Promise
 */
const invokeLambda = (name = '', payload = {}) => new Promise((resolve, reject) => {
    lambda.invoke({
        FunctionName: name,
        Payload: JSON.stringify(payload)
    }, err => {
        if(err) {
            console.log(err)
            reject(err)
        }

        resolve()
    }) 
})

module.exports = botBuilder(request => new Promise((resolve, reject) => {
    if(objectPath.has(request, 'originalRequest.message')) {
        resolve(new fbTemplate.Button('Login because, bla bla bla')
            .addLoginButton('https://s3.eu-central-1.amazonaws.com/digital-logistic-web/index.html')
            .get())
    } else if(objectPath.has(request, 'originalRequest.account_linking')) {
        return invokeLambda('finish_linking')
    } else {
        console.log('Unexpected event')
        reject()
    }
}), {platforms: ['facebook']})