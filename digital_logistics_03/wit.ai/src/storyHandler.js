const objectPath = require('object-path')

// Each function handles a defined user intent, it returns a promise which resolves with a message string or only a message string

module.exports = {
  rant: (story, finishStory) => {
    const rants = ['Du bist gemein :(', 'Sprich bitte nicht so unhöflich!']

    return finishStory()
      .then(() => rants[Math.floor(Math.random() * rants.length)])
  },

  different_time: (story, finishStory) => {
    if (objectPath.has(story, 'deliveryDate') && objectPath.has(story, 'parcelId')) {
      return finishStory()
        .then(() => `Klaro, wir bringen dir das Paket (${objectPath.get(story, 'parcelId')}) gerne am ${objectPath.get(story, 'deliveryDate')}`)
    }

    if (!objectPath.has(story, 'deliveryDate')) {
      return Promise.resolve('Wann dürfen wir dir dein Paket denn liefern?')
    }

    if (!objectPath.has(story, 'parcelId')) {
      return Promise.resolve('Wie lautet denn die Paket Nummer?')
    }
  },

  ask_for_feeling: (story, finishStory) => {
    const feelings = ['Ich bin ein Chatbot, mir geht es immer gut', 'Super geht es mir']

    return finishStory()
      .then(() => feelings[Math.floor(Math.random() * feelings.length)])
  },

  greeting: (story, finishStory) => {
    const greetings = ['Grüße dich', 'Hi duu!', 'Servus', 'Schönen guten Tag!']

    return finishStory()
      .then(() => greetings[Math.floor(Math.random() * greetings.length)])
  },

  multi_status: (story, finishStory) => finishStory()
    .then(() => 'Du möchtest etwas über mehrere Pakete wissen? Das haben wir leider noch nicht implementiert!'),

  different_place: (story, finishStory) => {
    if (objectPath.has(story, 'place') && objectPath.has(story, 'parcelId')) {
      return finishStory()
        .then(() => `Klaro, wir stellen das Paket (${objectPath.get(story, 'parcelId')}) in ${objectPath.get(story, 'place')} ab.`)
    }

    if (!objectPath.has(story, 'place')) {
      return Promise.resolve('Wo dürfen wir dein Paket denn für dich abstellen?')
    }

    if (!objectPath.has(story, 'parcelId')) {
      return Promise.resolve('Wie lautet denn die Paket Nummer?')
    }
  },

  single_status: (story, finishStory) => {
    if (objectPath.has(story, 'parcelId')) {
      return finishStory()
        .then(() => `Das Paket mit der Nummer ${story.parcelId} befindet sich in Auslieferung.`)
    }

    return 'Um welches Paket geht es denn? Schick mir bitte mal deine Paketnummer.'
  },

  general_question: (story, finishStory) => finishStory()
    .then(() => 'Wie kann ich dir helfen? Frag mich einfach wo dein Paket ist oder bitte mich es wo anders abzustellen.')
}
