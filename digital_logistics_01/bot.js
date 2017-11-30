const botBuilder = require('claudia-bot-builder');
const fbTemplate = botBuilder.fbTemplate;

const parser = request => {
    const matchStatus = request.text.match(/status\D*(\d+)/i);
    if (matchStatus) {
        const matchParcelNumber = matchStatus[1].match(/(\d{8})\D*/);
        if (matchParcelNumber) {
            return new fbTemplate.List()
            .addBubble('Sendungsstatus', `Auftragsnummer: ${matchParcelNumber[1]}`)
                .addImage('https://s3.eu-central-1.amazonaws.com/digital-logistic-web/01_pacel_received_done.png')
            .addBubble('Transport zum Paktezentrum')
                .addImage('https://s3.eu-central-1.amazonaws.com/digital-logistic-web/02_parcel_transport_done.png')
            .addBubble('Bearbeitung im Paketzentrum')
                .addImage('https://s3.eu-central-1.amazonaws.com/digital-logistic-web/03_parcel_factroy_in_progress.png')
            .addBubble('In Zustellung')
                .addImage('https://s3.eu-central-1.amazonaws.com/digital-logistic-web/04_parcel_delivery_open.png')    
            .get();
        } else {
            return 'Ungültige Auftragsnummer. Die Auftragsnummer ist 8-stellig.'
        } 
    }
    else {
        return 'Wir konnten Ihre Anfrage leider nicht verstehen.'
    }
};


module.exports = botBuilder(parser, {platforms: ['facebook']})