const objectPath = require('object-path')

const eventName = 'fill_slots'

module.exports = (req, api) => {
    let body = {}
    
    if (objectPath.get(req, 'body.result.resolvedQuery') !== eventName) {
        body = {
            followupEvent: {
                data: {
                    parcel_ids: 'id1, id2, id3',
                    locations: 'location1, location2, location3'
                },
                name: eventName
            }
        }
    }

    return new api.ApiResponse(body, {'Content-Type': 'application/json'}, 200)
}