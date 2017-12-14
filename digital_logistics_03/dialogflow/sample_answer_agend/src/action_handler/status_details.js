console.log('hier1')
const aws = require('aws-sdk')
console.log('hier2')
aws.config.update({region: 'eu-central-1'})
console.log('hier3')

module.exports = () => console.log('HIIII')