const ApiBuilder = require('claudia-api-builder')

const api = new ApiBuilder({mergeVars: true})

/**
 * This HTTP event handler always resolves with the hub.challenge extracted from the request's query string, if available
 * It handles message events by parsing them and sending a message back via the FB API
 * @param {Object} req aws lambda request object
 * @returns {Promise.<Number|null>} Number being the challenger, sent in the query string at 'hub.challenge'
 */
const dialogflowEventHandler = req => {
    console.log('running dialogflowEventHandler')

    console.log(req)

    return new api.ApiResponse({
            "speech": "Barack Hussein Obama II was the 44th and current President of the United States.",
            "displayText": "Barack Hussein Obama II was the 44th and current President of the United States, and the first African American to hold the office. Born in Honolulu, Hawaii, Obama is a graduate of Columbia University   and Harvard Law School, where ",
            "data": {},
            "contextOut": [],
            "source": "Sample_answer_agend"},
        {'Content-Type': 'application/json'}, 200)

}


api.post('/dialogflow_example', dialogflowEventHandler)

module.exports = api
