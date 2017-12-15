const objectPath = require('object-path')

module.exports = req => {
    const intent = objectPath.get(req, 'body.result.metadata.intentName')
    return `fill_slots_${intent}`
}