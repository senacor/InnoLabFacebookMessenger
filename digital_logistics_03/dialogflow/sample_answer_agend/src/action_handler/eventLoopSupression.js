module.exports = (req) => {
    const intent = objectPath.get(req, 'body.result.metadata.intentName')
    const fill_slots_event_name = `fill_slots_${intent}`

    if(req.body.result.resolvedQuery === fill_slots_event_name){
        console.log(`Suppress event calling loog for event ${fill_slots_event_name}`)
        return false
    }else {
        return true
    }
}
