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
                            status: 'in Auslieferung',
                            parcel_id: String(req.body.result.parameters.parcel_id.parcel_id),
                            current: {
                                description:  'Das Paket wir im Paketzentrum Neuwied bearbeitet',
                                map_location: 'Neuwied+Rostocker+Str+14'
                            }
                        },
                        name: eventLoopSuppression.getFillSlotsEventName(req)
                    }
                }
            })



        // return resolve(new api.ApiResponse({
        //     followupEvent: {
        //         data: {
        //             status: 'in Auslieferung',
        //             parcel_id: String(req.body.result.parameters.parcel_id.parcel_id),
        //             current: {
        //                 description:  'Das Paket wir im Paketzentrum Neuwied bearbeitet',
        //                 map_location: 'Neuwied+Rostocker+Str+14'
        //             }
        //         },
        //         name: eventLoopSuppression.getFillSlotsEventName(req)
        //     }
        // }, {'Content-Type': 'application/json'}, 200))
    }

    return calculateResult()
        .then(result => new api.ApiResponse(result, {'Content-Type': 'application/json'}, 200))
}
