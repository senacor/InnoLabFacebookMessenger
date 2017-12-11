const objectPath = require('object-path')
const aws = require('aws-sdk')
const DOC = require('dynamodb-doc')

aws.config.update({region: 'eu-central-1'})
const lambda = new aws.Lambda()

const docClient = new DOC.DynamoDB()

/**
 * Extracts a 8 digit number out of a string
 * @param {String} msg 
 * @return String parcel id or empty string
 */
const extractParcelId = msg => objectPath.get(msg.match(/(\d{8})\D*/), '1', null)

/**
 * Creates or updates a session in db, psid is unique key!
 * @param {String|Number} sender Facebook page scoped user id
 * @param {String|Number} parcelId
 * @param {String} intent
 * @return Promise once data is put to db
 */
const upsertStory = (sender, parcelId, intent) => new Promise((resolve, reject) => {
    const getParams = {
        TableName: 'wit_ai_stories',
        Key: {
            psid: String(sender)
        }
    }

    docClient.getItem(getParams, (err, data) => {
        if(err) {
            return reject(err)
        }

        const putParams = {
            TableName: 'wit_ai_stories',
            Item: {
                psid: String(sender)
            }
        }

        if(data.Item) {
            putParams.Item = Object.assign(putParams.Item, data.Item)
        }

        if(parcelId) {
            putParams.Item.parcelId = String(parcelId)
        }

        if(intent) {
            putParams.Item.intent = String(intent)
        }

        docClient.putItem(putParams, (err, data) => {
            if(err) {
                return reject(err)
            }

            resolve(putParams.Item)
        })
    })
})

/**
 * Delete a sender's story
 * @param {String|Number} sender 
 * @return Promise once db operations are done
 */
const deleteStory = sender => new Promise((resolve, reject) => {
    const params = {
        TableName: 'wit_ai_stories',
        Key: {
            psid: String(sender)
        }
    }

    docClient.deleteItem(params, err => {
        if(err) {
            return reject(err)
        }

        resolve()
    })
})

const handler = {
    rant: () => new Promise(resolve => {
        const rants = ['Du bist gemein :(', 'Sprich bitte nicht so unhöflich!']
        resolve(rants[Math.floor(Math.random() * rants.length)])
    }),

    different_time: () => new Promise((resolve, reject) => resolve('different_time')),
    ask_for_feeling: () => new Promise((resolve, reject) => resolve('ask_for_feeling')),
    greeting: () => new Promise((resolve, reject) => resolve('greeting')),
    multi_status: () => new Promise((resolve, reject) => resolve('multi_status')),
    different_place: () => new Promise((resolve, reject) => resolve('different_place')),

    single_status: (sender, story) => {
        if(objectPath.has(story, 'parcelId')) {
            return deleteStory(sender)
                .then(() => `Das Paket mit der Nummer ${story.parcelId} befindet sich in Auslieferung.`)
        }

        return upsertStory(sender, null, 'single_status')
            .then(() => 'Um welches Paket geht es denn? Schick mir bitte mal deine Paketnummer.')
    }
}

exports.handler = (event, context, callback) => {
    const {intent, msg, sender} = event

    console.log(`Found event ${JSON.stringify(intent)}`)

    upsertStory(sender, extractParcelId(msg))
        .then(story => {
            if(objectPath.get(story, 'intent') && handler[story.intent]) {
                return handler[story.intent](sender, story)
            } else if(parseInt(intent.confidence) < 0.7){
                return 'Ich bin mir nicht ganz sicher was du meinst?'
            } else if(handler[intent.value]) {
                return handler[intent.value](sender)
            } else {
                return 'Tut mir leid, ich hab dich nicht verstanden.'
            }
        })
        .then(response => callback(null, {response}))
        .catch(err => {
            console.error(err)
            callback(null, {response: 'Leider ist etwas schief gelaufen.'})
        })
}