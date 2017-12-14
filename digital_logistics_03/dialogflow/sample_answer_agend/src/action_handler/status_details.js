console.log('FIRST FU LINE')

const objectPath = require('object-path')
console.log('4 FU LINE')
const db = require('../db')
console.log('6 FU LINE')

const eventName = 'status_details'

console.log('8 FU LINE')

module.exports = (req, api) => {
    console.log('hierhierhierhierhier')
    // SENDER ID: console.log(req.body.originalRequest.data.sender.id)

    const parcelId = objectPath.get(req, 'result.parameters.parcel_id.parcel_id')
    let calculateResult = () => {
        console.log('hier2')
        return Promise.resolve({})
    }

    console.log('hier')

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

    console.log('hier3')

    return calculateResult()
        .then(result => new api.ApiResponse(result, {'Content-Type': 'application/json'}, 200))
}

console.log('LAST FU LINE')