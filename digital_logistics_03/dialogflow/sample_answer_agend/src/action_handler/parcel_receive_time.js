const eventLoopSuppression = require('../eventLoopSupression')
const objectPath = require('object-path')
const db = require('../db')

let calculateResult = () => {
    return Promise.resolve({})
}

module.exports = (req, api) => {
    if (eventLoopSuppression.checkShoudSuppress(req)) {
        const parcelId = objectPath.get(req, 'body.result.parameters.parcel_id.parcel_id')

        calculateResult = () =>  db.getParcels(parcelId)
            .then(parcels => {
                const parcel = parcels[parcelId]

                if (!parcel) {
                    // TODO do something and handle it in dialogflow
                }

                return {
                    followupEvent: {
                        data: {
                            delivery_date: objectPath.get(parcel, 'expected_delivery', ''),
                            map_location: objectPath.get(parcel, 'current_location', ''),
                            parcel_id: parcelId
                        },
                        name: eventLoopSuppression.getFillSlotsEventName(req)
                    }
                }
            })

    }

    return calculateResult()
        .then(result => new api.ApiResponse(result, {'Content-Type': 'application/json'}, 200))
}