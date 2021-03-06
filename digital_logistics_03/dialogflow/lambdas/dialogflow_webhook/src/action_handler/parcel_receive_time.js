const objectPath = require('object-path')
const db = require('../db')
const getFillSlotsEventName = require('../helper_functions/getFillSlotsEventName')
const checkShouldSuppress = require('../helper_functions/checkShouldSuppress')

/**
 * Default response if event isn't handled
 */
let calculateResult = () => {
    return Promise.resolve({})
}

/**
 * This endpoint reads a the requested parcel's shipping information, and returns the expected delivery time and current location, readable for dialogflow
 * @param {Object} req http request object
 * @param {Object} api claudia api object
 * @returns Promise.<{Object}> resolves with a claudia api response, which returns a JSON to the client
 */
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
                            name: 'fill_slots_parcel_receive_time' 
                        }
                    }
                }

                return {
                    followupEvent: {
                        data: {
                            delivery_date: objectPath.get(parcel, 'expected_delivery', ''),
                            map_location: objectPath.get(parcel, 'current_location', ''),
                            parcel_id: parcelId
                        },
                        name: getFillSlotsEventName(req)
                    }
                }
            })

    }

    return calculateResult()
        .then(result => new api.ApiResponse(result, {'Content-Type': 'application/json'}, 200))
}