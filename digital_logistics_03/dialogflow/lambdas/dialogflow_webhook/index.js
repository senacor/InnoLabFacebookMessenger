const objectPath = require('object-path')
const ApiBuilder = require('claudia-api-builder')
const handler = require('./src/action_handler')

const api = new ApiBuilder({mergeVars: true})

const dialogflowEventHandler = req => {
    const action = objectPath.get(req, 'body.result.action', '')

    console.log(`Headers: ${JSON.stringify(req.headers)}`)
    console.log(`Body: ${JSON.stringify(req.body)}`)
    console.log(`Complete: ${JSON.stringify(req)}`)

    console.log(`Trying to invoke action handler for action: ${action}`)

    if (handler[action]) {
        console.log('Found action handler')
        return handler[action](req, api)
            .then(result => {
                console.log(JSON.stringify(result))
                return result
            })
    }

    console.log('No action handler found')
    console.log('Returning default result')
    return new api.ApiResponse({}, {'Content-Type': 'application/json'}, 200)
}

api.post('/dialogflow_example', dialogflowEventHandler)

module.exports = api
