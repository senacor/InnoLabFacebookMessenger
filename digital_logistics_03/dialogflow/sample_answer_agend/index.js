const objectPath = require('object-path')
const parcel_location = require('./intent_parcel_location')
const ApiBuilder = require('claudia-api-builder')

const api = new ApiBuilder({mergeVars: true})

const dialogflowEventHandler = req => {
    console.log('running dialogflowEventHandler')

    const intent = objectPath.get(req, 'body.result.metadata.intentName');

    console.log(req.headers)
    console.log(JSON.stringify(req, null, 2))
    console.log(JSON.stringify(req.body, null, 2))
    console.log(`Invoked for intent: ${intent}`)

    let response
    switch (intent) {
        case 'parcel_location': 
            response = parcel_location(req, api)
            break
        default:
            response = new api.ApiResponse({}, {'Content-Type': 'application/json'}, 200)
            break
    }
    console.log(JSON.stringify(response, null, 2))
    return response
}

api.post('/dialogflow_example', dialogflowEventHandler)

module.exports = api
