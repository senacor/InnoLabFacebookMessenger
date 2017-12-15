const objectPath = require('object-path')
const aws = require('aws-sdk')
aws.config.update({region: 'eu-central-1'})
const db = require('../db')

const eventName = 'fill_slots_display_status_details'
const icons = {
    received: 'https://s3.eu-central-1.amazonaws.com/digital-logistic-web/01_pacel_received_done.png',
    transport: 'https://s3.eu-central-1.amazonaws.com/digital-logistic-web/02_parcel_transport_done.png',
    factory: 'https://s3.eu-central-1.amazonaws.com/digital-logistic-web/03_parcel_factroy_done.png',
    delivery: 'https://s3.eu-central-1.amazonaws.com/digital-logistic-web/04_parcel_delivery_done.png'
}

module.exports = (req, api) => {
    // SENDER ID: console.log(req.body.originalRequest.data.sender.id)

    console.log(JSON.stringify(req.body.result))
    const parcelId = objectPath.get(req, 'body.result.parameters.parcel_id')

    console.log('parcelId: ' + parcelId) // TODO this results to [object object] ?

    let calculateResult = () => {
        return Promise.resolve({})
    }

    if (req.body.result.resolvedQuery !== eventName) {
        calculateResult = () => {
            return db.getParcels(parcelId)
                .then(parcels => {
                    console.log(JSON.stringify(parcels))
                    let parcelIsDone = true

                    const data = {
                        parcel_id: parcelId,
                        status: 'Unbekannt'
                    }

                    parcels.forEach(status => {
                        data[status.type] = {
                            description: status.description,
                            Status: status.Status,
                            type: status.type,
                            icon_prefix: icons[status.type]
                        }

                        if (status.Status === 'in_progress') {
                            data.status = 'In Auslieferung'
                        }

                        if (status.Status !== 'done'){
                            parcelIsDone = false
                        }
                    })

                    data.status = parcelIsDone

                    const result = {
                        followupEvent: {
                            data,
                            name: eventName
                        }
                    }

                    return result
                })
        }
    }

    return calculateResult()
        .then(result => new api.ApiResponse(result, {'Content-Type': 'application/json'}, 200))
}