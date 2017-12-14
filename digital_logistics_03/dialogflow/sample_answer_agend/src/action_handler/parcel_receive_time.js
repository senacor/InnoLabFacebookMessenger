const eventLoopSuppression = require('./eventLoopSupression')

module.exports = (req, api) => {
    if (eventLoopSuppression(req) && req.body.result.parameters.parcel_id.parcel_id) {
        return new api.ApiResponse({
            followupEvent: {
                data: {
                    delivery_date: '15.12.2017',
                    image_header: 'https://s3.eu-central-1.amazonaws.com/digital-logistic-web/00_pacel_images_header.png',
                    parcel_id: String(req.body.result.parameters.parcel_id.parcel_id),
                },
                name: fill_slots_event_name
            }
        },
        {'Content-Type': 'application/json'}, 200)

    } else {
        return new api.ApiResponse({},
            {'Content-Type': 'application/json'}, 200)
    }
}
