const objectPath = require('object-path')
const ApiBuilder = require('claudia-api-builder')
const handler = require('./src/action_handler')

const api = new ApiBuilder({mergeVars: true})

const dialogflowEventHandler = req => {
    const action = objectPath.get(req, 'body.result.action', '')

    console.log(req.headers)
    console.log(JSON.stringify(req, null, 2))
    console.log(JSON.stringify(req.body, null, 2))

    console.log(`Invoked action handler for action: ${action}`)

    if (handler[action]) {
        return  handler[action](req, api)
    }

    return new api.ApiResponse({}, {'Content-Type': 'application/json'}, 200)
}

api.post('/dialogflow_example', dialogflowEventHandler)

module.exports = api
