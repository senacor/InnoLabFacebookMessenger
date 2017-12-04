const ApiBuilder = require('claudia-api-builder')

const api = new ApiBuilder({mergeVars: true})

api.post('/', req => {
    let data
    try {
        data = JSON.parse(req.body)
    } catch(e) {
        return new Error('Could not parse payload')
    }

    console.log(data)

    return JSON.stringify({authorizationCode: '123'})
})

module.exports = api
