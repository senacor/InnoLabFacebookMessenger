# Wit.ai

End of summer 2017 Facebook [deprecated Wit's bot engine and story GUI](https://wit.ai/blog/2017/07/27/sunsetting-stories). The bot engine and story GUI could be used to make conversations with a user. The conversation's aim could be to retrieve several contact information of a user. As soon as the user provided phone number, email and address the bot engine would have called your service with this information. Facebook deprecated this features in favor of GUI elements for their messenger. According to their blog post GUI elements and forms are provide a more pleasant user experience: "constant visual feedback, ability to modify previous choices, etc." Facebook from now on focuses on good and scalable NLP.
Other tools like AWS Lex and Google Dialogflow [still have similar features](../).

We enabled Wit as message proxy at the Facebook developer console for our Facebook app. By doing that our application not only receives the user's message but also the result of Wit's NLP.
![Turn on WIT](nlp_proxy.png)

Alternatively Wit can be used via a [REST service](https://wit.ai/docs/http/20170307).

Our [application](../../digital_logistics_03/wit.ai) receives a NLP object from Facebook, containing the parsed message.

```javascript
{
    "datetime": [
        {
            "confidence": 0.96767,
            "values": [
                {
                    "value": "2017-12-15T00:00:00.000+01:00",
                    "grain": "day",
                    "type": "value"
                },
                /* ... */
            ],
            "value": "2017-12-15T00:00:00.000+01:00",
            "grain": "day",
            "type": "value",
            "_entity": "datetime",
            "_body": "Freitag",
            "_start": 8,
            "_end": 15
        }
    ],
    "intent": [
        {
            "confidence": 0.96539204235584,
            "value": "different_time",
            "_entity": "intent"
        },
        {
            "confidence": 0.013096601070874,
            "value": "rant",
            "_entity": "intent"
        },
        /* ... */
    ]
}
```

Intents are defined by us, we discard all but the intent with the highest confidence and call a specific event handler for each possible user intent.

To train Wit recognizing your intents you need to provide example sentences for each intent.

![Train WIT](train.png)

A simple event handler we implement asks the user for all details, such as place or date, it needs and performs the task the user asks for, as soon as all data is provided.

The following event handler handles messages where a user wants to re-route the parcel to a different place.

```javascript
different_place: (story, finishStory) => {
    // Check if user provided the new place, if not, ask user
    if (!objectPath.has(story, 'place')) {
        return Promise.resolve('Wo dürfen wir dein Paket denn für dich abstellen?')
    }

    // Check if the user provided the parcel id, if not, ask user
    if (!objectPath.has(story, 'parcelId')) {
        return Promise.resolve('Wie lautet denn die Paket Nummer?')
    }

    // If all needed data is available, do re-routing and inform user
    if (objectPath.has(story, 'place') && objectPath.has(story, 'parcelId')) {
        return finishStory()
        .then(() => {
            // Call business logic ...
        })
        .then(() => `Klaro, wir stellen das Paket (${objectPath.get(story, 'parcelId')}) in ${objectPath.get(story, 'place')} ab.`)
    }
}
```