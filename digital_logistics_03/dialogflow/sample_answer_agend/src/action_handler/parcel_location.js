const eventLoopSuppression = require('./eventLoopSupression')

module.exports = (req, api) => {
    if (eventLoopSuppression(req) && req.body.result.parameters.parcel_id.parcel_id) {
        return new api.ApiResponse({
            followupEvent: {
                data: {
                    status: 'in Auslieferung',
                    parcel_id: String(req.body.result.parameters.parcel_id.parcel_id),
                    current: {
                        description:
                                'Auslieferung am 01.12.2017 erfolgreich',
                        Status:
                                'done',
                        type:
                                'delivery',
                        icon_prefix:
                                'https://s3.eu-central-1.amazonaws.com/digital-logistic-web/04_parcel_delivery_done.png'
                    }
                },
                name: 'fill_slots'
            }
        }, {'Content-Type': 'application/json'}, 200)
    } else {
        return new api.ApiResponse({}, {'Content-Type': 'application/json'}, 200)
    }
}
