const objectPath = require('object-path')

/**
 * Extracts event name from request object and compares it with intent to prevent endless loops (dialog flow event calls event calls dialog flow event)
 * @param {Object} req http request object
 * @returns {Boolean} true if event should be handled
 */
module.exports = req => {
    const intent = objectPath.get(req, 'body.result.metadata.intentName')
    const fill_slots_event_name = `fill_slots_${intent}`

    if (req.body.result.resolvedQuery === fill_slots_event_name){
        console.log(`Suppress event calling loog for event ${fill_slots_event_name}`)
        return false
    } else {
        return true
    }
}