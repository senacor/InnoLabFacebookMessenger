const botBuilder = require('claudia-bot-builder')
const objectPath = require('object-path')
const aws = require('aws-sdk')
const messageSender = require('./src/messageSender')
const storyFinder = require('./src/storyFinder')
const storyHandler = require('./src/storyHandler')
const db = require('./src/db')

aws.config.update({region: 'eu-central-1'})

module.exports = botBuilder((request, originalApiBuilderRequest) => {
  const fbAccessToken = objectPath.get(originalApiBuilderRequest, 'env.facebookAccessToken')
  const sender = objectPath.get(request, 'sender')

  messageSender.send(fbAccessToken, { sender_action: 'typing_on', recipient: { id: sender } })

  const nlp = objectPath.get(request, 'originalRequest.message.nlp.entities', [])
  const intent = objectPath.get(nlp, 'intent.0', '')

  return storyFinder.find(nlp, sender)
    .then(story => {
      // 1. Is there a previous, still active story?
      if (objectPath.get(story, 'intent') && storyHandler[story.intent]) {
        return storyHandler[story.intent](story, () => db.finishStory(story))
      }

      // 2. If it's a new intent, are we sure enough to talk about it?
      if (parseFloat(intent.confidence) < 0.7) {
        return 'Ich bin mir nicht ganz sicher was du meinst?'
      }

      // 3. Create new story and call handler if available
      if (storyHandler[intent.value]) {
        return db.upsertStory(sender, {intent: intent.value})
          .then(story => storyHandler[intent.value](story, () => db.finishStory(story)))
      }

      // 4. None of above options are valid => we did not understand the user
      return 'Tut mir leid, ich hab dich nicht verstanden.'
    })
    .catch(err => {
      console.error(err)
      return 'Leider ist etwas schief gelaufen.'
    })
    .then(msg => {
      const requestBody = {
        messaging_type: 'RESPONSE',
        recipient: {
          id: sender
        },
        message: {
          text: msg
        }
      }

      return messageSender.send(fbAccessToken, requestBody)
    })
    .catch(err => console.error(err))
}, {platforms: ['facebook']})
