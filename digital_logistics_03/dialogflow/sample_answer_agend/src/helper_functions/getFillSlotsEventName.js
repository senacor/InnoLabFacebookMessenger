const objectPath = require('object-path')

/**
 * Creates event name by intent
 * @param {Object} req http request object
 * @returns {String} event name
 */
module.exports = req => {
    const intent = objectPath.get(req, 'body.result.metadata.intentName')
    return `fill_slots_${intent}`
}