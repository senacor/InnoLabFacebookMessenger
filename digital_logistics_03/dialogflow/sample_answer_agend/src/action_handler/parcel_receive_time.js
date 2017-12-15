const eventLoopSuppression = require('../eventLoopSupression')

module.exports = (req, api) => new Promise((resolve, reject) => {
    if (eventLoopSuppression.checkShoudSuppress(req) && req.body.result.parameters.parcel_id.parcel_id) {
        return resolve(new api.ApiResponse({
            followupEvent: {
                data: {
                    delivery_date: '15.12.2017',
                    image_header: 'https://s3.eu-central-1.amazonaws.com/digital-logistic-web/00_pacel_images_header.png',
                    parcel_id: String(req.body.result.parameters.parcel_id.parcel_id),
                    map_location: 'Koeln+Leichweg+22'
                },
                name: eventLoopSuppression.getFillSlotsEventName(req)
            }
        },
        {'Content-Type': 'application/json'}, 200))

    } else {
        return resolve(new api.ApiResponse({},
            {'Content-Type': 'application/json'}, 200))
    }
})
