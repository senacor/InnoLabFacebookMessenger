const objectPath = require('object-path')
const ApiBuilder = require('claudia-api-builder')

const api = new ApiBuilder({mergeVars: true})

const dialogflowEventHandler = req => {
    console.log('running dialogflowEventHandler')

    const action = objectPath.get(req, 'body.result.action')

    console.log(req.headers)
    console.log(JSON.stringify(req, null, 2))
    console.log(JSON.stringify(req.body, null, 2))

    let response
    try {
        console.log(`Invoked action handler for action: ${action}`)
        let actionHandler = require(`./src/action_handler/${action}`)
        console.log('kooooomisch')
        response = actionHandler(req, api)
        console.log(`Action handler for ${action} invoked successfully`)
    } catch (err){
        console.log(`Exception while calling action handler for ${action}!`)
        console.log(err)
        response = new api.ApiResponse({}, {'Content-Type': 'application/json'}, 200)
    }
    console.log(JSON.stringify(response, null, 2))
    return response
}

api.post('/dialogflow_example', dialogflowEventHandler)

module.exports = api
