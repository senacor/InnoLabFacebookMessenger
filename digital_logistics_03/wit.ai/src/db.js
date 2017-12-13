const aws = require('aws-sdk')
const DOC = require('dynamodb-doc')

aws.config.update({region: 'eu-central-1'})
const docClient = new DOC.DynamoDB()

const db = {
  /**
   * Creates or updates a session in db, psid is unique key!
   * @param {String|Number} sender Facebook page scoped user id
   * @param {String|Number} parcelId
   * @param {String} intent
   * @return Promise once data is put to db
   */
  upsertStory: (sender, values) => {
    return db.getStory(sender)
      .then(story => new Promise((resolve, reject) => {
        const params = {
          TableName: 'wit_ai_stories',
          Item: {}
        }

        // Assign previous attributes
        if (story) {
          params.Item = Object.assign(params.Item, story)
        }

        // Assign upserting values
        Object.keys(values).forEach(attribute => {
          params.Item[attribute] = values[attribute]
        })

        // Assign sender
        params.Item = Object.assign(params.Item, { psid: String(sender) })

        console.log(`Upserting params: ${JSON.stringify(params)}`)

        docClient.putItem(params, (err, data) => {
          if (err) {
            return reject(err)
          }

          resolve(params.Item)
        })
      }))
  },

  /**
   * Retrieves story by fb sender psid
   * @param {String|Number} sender fb psid of sender
   * @return Promise once db operations are done
   */
  getStory: sender => new Promise((resolve, reject) => {
    const params = {
      TableName: 'wit_ai_stories',
      Key: {
        psid: String(sender)
      }
    }

    docClient.getItem(params, (err, data) => {
      if (err) {
        return reject(err)
      }

      resolve(data.Item)
    })
  }),

  /**
   * Delete a sender's story
   * @param {String|Number} sender 
   * @return Promise once db operations are done
   */
  finishStory: story => new Promise((resolve, reject) => {
    let updateExpression = 'remove ' + Object.keys(story)
      // Keep psid field
      .filter(field => field !== 'psid' && field !== 'parcelId')
      .join(', ')

    console.log(updateExpression)

    const params = {
      TableName: 'wit_ai_stories',
      Key: {
        psid: String(story.psid)
      },
      UpdateExpression: updateExpression
    }

    docClient.updateItem(params, err => {
      if (err) {
        return reject(err)
      }

      resolve()
    })
  })
}

module.exports = db
