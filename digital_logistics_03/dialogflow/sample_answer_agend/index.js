const objectPath = require('object-path')
const ApiBuilder = require('claudia-api-builder')

const api = new ApiBuilder({mergeVars: true})

const dialogflowEventHandler = req => {
    console.log('running dialogflowEventHandler')

    const intent = objectPath.get(req, 'body.result.metadata.intentName');

    console.log(req.headers)
    console.log(JSON.stringify(req, null, 2))
    console.log(JSON.stringify(req.body, null, 2))


    let response
    try {
        console.log(`Invoked intent handler for intent: ${intent}`)
        let intentHandler = require('./intent_handler/'+intent)
        response = intentHandler(req, api)
        console.log(`Intent handler for ${intent} invoked successfully`)
    }catch (err){
        console.log("exception while calling intent handler!")
        console.log(err)
        console = new api.ApiResponse({}, {'Content-Type': 'application/json'}, 200)
    }
    console.log(JSON.stringify(response, null, 2))
    return response
}

api.post('/dialogflow_example', dialogflowEventHandler)

module.exports = api
