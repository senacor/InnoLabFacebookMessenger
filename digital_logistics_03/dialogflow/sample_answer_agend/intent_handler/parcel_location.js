module.exports = (req, api) => {
    if (req.body.result.resolvedQuery != 'fill_slots' && req.body.result.parameters.parcel_id.parcel_id) {
        return new api.ApiResponse({
            followupEvent: {
                data: {
                    status: 'in Auslieferung',
                    parcel_id: String(req.body.result.parameters.parcel_id.parcel_id),
                    icon: '04_parcel_delivery_in_progress.png',
    
                    received: {
                        description:
                                    'Paket am 28.11.2017 an Digital Logistics übergeben',
                        Status:
                                    'done',
                        type:
                                    'received',
                        icon_prefix:
                                    'https://s3.eu-central-1.amazonaws.com/digital-logistic-web/01_pacel_received_done.png'
                    },
                    transport: {
                        description:
                                    'Transport am 29.11.2017 in Warenlager Bonn',
                        Status:
                                    'done',
                        type:
                                    'transport',
                        icon_prefix:
                                    'https://s3.eu-central-1.amazonaws.com/digital-logistic-web/02_parcel_transport_done.png'
                    },
                    factory: {
                        description:
                                    'Verarbeitung am Warenhaus am 30.11.2017',
                        Status:
                                    'done',
                        type:
                                    'factory',
                        icon_prefix:
                                    'https://s3.eu-central-1.amazonaws.com/digital-logistic-web/03_parcel_factroy_done.png'
                    },
                    delivery: {
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
        },
        {'Content-Type': 'application/json'}, 200)
    
    } else {
        return new api.ApiResponse({},
            {'Content-Type': 'application/json'}, 200)
    }
}