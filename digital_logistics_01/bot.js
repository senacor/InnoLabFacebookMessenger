
const botBuilder = require('claudia-bot-builder');
const fbTemplate = botBuilder.fbTemplate;

const doc = require('dynamodb-doc');
const dynamoDb = new doc.DynamoDB();

const buildTemplate = (data, queried_parcel_id) => {
    console.log(data);
    if (data.Items.length === 0) {
        console.log(`could not find parcel_id: ${queried_parcel_id}`);
        return 'Wir konnten zu der Auftragsnummer kein Paket finden.';
    }
    console.log('Found parcel!');
    return new fbTemplate.List()
    .addBubble('Sendungsstatus', `Auftragsnummer: ${data.Items[0].parcel_id}`)
        .addImage(`https://s3.eu-central-1.amazonaws.com/digital-logistic-web/01_pacel_received_${data.Items[0].Status[0].Status}.png`)
    .addBubble('Transport zum Paktezentrum', `${data.Items[0].Status[1].description}`)
        .addImage(`https://s3.eu-central-1.amazonaws.com/digital-logistic-web/02_parcel_transport_${data.Items[0].Status[1].Status}.png`)
    .addBubble('Bearbeitung im Paketzentrum', `${data.Items[0].Status[2].description}`)
        .addImage(`https://s3.eu-central-1.amazonaws.com/digital-logistic-web/03_parcel_factroy_${data.Items[0].Status[2].Status}.png`)
    .addBubble('In Zustellung', `${data.Items[0].Status[3].description}`)
        .addImage(`https://s3.eu-central-1.amazonaws.com/digital-logistic-web/04_parcel_delivery_${data.Items[0].Status[3].Status}.png`)
    .get()
}

const parser = request => {
    return new Promise(resolve => {
        console.log(request);
        const matchStatus = request.text.match(/status\D*(\d+)/i);
        if (matchStatus) {
            const matchParcelNumber = matchStatus[1].match(/(\d{8})\D*/);
            if (matchParcelNumber) {
                console.log(`Search in dynamoDb for parcel_id ${matchParcelNumber[1]}`);
                dynamoDb.query({
                    ExpressionAttributeValues: {
                       ":v1": matchParcelNumber[1]
                    },
                KeyConditionExpression: "parcel_id = :v1",
                TableName: "digital_logistics_parcel"
                }, (err, data) => {
                    if (err) {
                        console.log(`could not find parcel_id: ${err}`);
                        return resolve("Wir konnten zu der Auftragsnummer kein Paket finden.");
                    }

                    return resolve(buildTemplate(data, matchParcelNumber[1]));
                });
            } else {
                console.log('Invalid parcel id');
                return resolve('Ungültige Auftragsnummer. Die Auftragsnummer ist 8-stellig.')
            } 
        }
        else {
            console.log('could not understand request');
            return resolve('Wir konnten Ihre Anfrage leider nicht verstehen.')
        }
    });
};


module.exports = botBuilder(parser, {platforms: ['facebook']})

/**
 * const authorizationCode = objectPath.get(event, 'account_linking.authorization_code')
            const senderPsid = objectPath.get(event, 'sender.id')
 */