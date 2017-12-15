const objectPath = require('object-path')
const db = require('../db')
const calcParcelStatus = require('../helper_functions/calcParcelStatus')
const getFillSlotsEventName = require('../helper_functions/getFillSlotsEventName')
const checkShouldSuppress = require('../helper_functions/checkShouldSuppress')

let calculateResult = () => {
    return Promise.resolve({})
}

module.exports = (req, api) => {
    if (checkShouldSuppress(req)) {
        const parcelId = objectPath.get(req, 'body.result.parameters.parcel_id.parcel_id')

        calculateResult = () =>  db.getParcels(parcelId)
            .then(parcels => {
                const parcel = parcels[parcelId]

                if (!parcel) {
                    return { 
                        followupEvent: {
                            data: {
                                error_message: 'Es konnte kein Paket gefunden werden', 
                            }, 
                            name: 'fill_slots_parcel_location' 
                        }
                    }
                }

                const {status, description} = calcParcelStatus(parcel)

                return {
                    followupEvent: {
                        data: {
                            status,
                            parcel_id: parcelId,
                            current: {
                                description,
                                map_location: objectPath.get(parcel, 'current_location')
                            }
                        },
                        name: getFillSlotsEventName(req)
                    }
                }
            })
    }

    return calculateResult()
        .then(result => new api.ApiResponse(result, {'Content-Type': 'application/json'}, 200))
}
