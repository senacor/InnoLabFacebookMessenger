const objectPath = require('object-path')
const db = require('./db')

/**
 * Extracts a 8 digit number out of a string
 * @param {String} msg 
 * @return String parcel id or null
 */
const extractParcelId = msg => objectPath.get(msg.match(/(\d{8})\D*/), '1', null)

module.exports = {
  /**
   * Extracts relevant data from nlp/message, upserts story and returns it
   * @param {Object} nlp contains intents and extracted values of the message
   * @param {Number|String} sender fb psid of user
   * @returns Promise.<{Object}> resolves with current story
   */
  find: (nlp, sender) => {
    console.log(`Found event ${JSON.stringify(nlp)}`)

    // Update extracted information if available
    const extractedInformation = {}

    if (objectPath.has(nlp, 'number.0.value')) {
      const parcelId = extractParcelId(String(objectPath.get(nlp, 'number.0.value')))
      if (parcelId) {
        extractedInformation.parcelId = parcelId
      }
    }

    if (objectPath.has(nlp, 'location.0.value')) {
      extractedInformation.place = objectPath.get(nlp, 'location.0.value')
    }

    if (objectPath.has(nlp, 'datetime.0.value')) {
      extractedInformation.deliveryDate = objectPath.get(nlp, 'datetime.0.value')
    }

    let getOrUpdateStory = () => db.getStory(sender)
    if (Object.keys(extractedInformation).length > 0) {
      getOrUpdateStory = () => db.upsertStory(sender, extractedInformation)
    }

    return getOrUpdateStory()
  }
}
