const objectPath = require('object-path')
const aws = require('aws-sdk')
aws.config.update({region: 'eu-central-1'})
const db = require('../db')

const eventName = 'fill_slots_display_status_details'

module.exports = (req, api) => {
    // SENDER ID: console.log(req.body.originalRequest.data.sender.id)

    const parcelId = objectPath.get(req, 'result.parameters.parcel_id.parcel_id')
    let calculateResult = () => {
        return Promise.resolve({})
    }

    if (req.body.result.resolvedQuery !== eventName) {
        console.log('hier1')
        calculateResult = () => {
            console.log('hier4')
            return db.getParcels(parcelId)
                .then(parcels => {
                    console.log('hier5')
                    console.log(parcels)
                    const result = {
                        followupEvent: {
                            data: { }
                        }
                    }

                    return result
                })
        }
    }

    return calculateResult()
        .then(result => new api.ApiResponse(result, {'Content-Type': 'application/json'}, 200))
}