const eventLoopSuppression = require('../eventLoopSupression')

module.exports = (req, api) => new Promise((resolve, reject) => {
    if (eventLoopSuppression.checkShoudSuppress(req) && req.body.result.parameters.parcel_id.parcel_id) {
        return resolve(new api.ApiResponse({
            followupEvent: {
                data: {
                    status: 'in Auslieferung',
                    parcel_id: String(req.body.result.parameters.parcel_id.parcel_id),
                    current: {
                        description:  'Das Paket wir im Paketzentrum Neuwied bearbeitet',
                        map_location: 'Neuwied+Rostocker+Str+14'
                    }
                },
                name: eventLoopSuppression.getFillSlotsEventName(req)
            }
        }, {'Content-Type': 'application/json'}, 200))
    } else {
        return resolve(new api.ApiResponse({}, {'Content-Type': 'application/json'}, 200))
    }
})
