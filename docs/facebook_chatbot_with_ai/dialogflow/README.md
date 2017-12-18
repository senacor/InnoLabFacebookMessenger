# Dialogflow

Dialogflow by Google is more feature rich than wit.ai. It provides a conversational state and therefore allows dialog communication between the user and the Dialogflow agent. Dialogflow exchanges messages to some messenger directly. In addition to Facebook messenger it supports Slack, Alexa and many others. Since Dialogflow handles the conversation itself, it either recognizes an 'intent' or it does not (and provides a default respsone). Within an 'intent' there can exist 'entities'. Those are business values that must be provided by the user. The 'entities' can be stored in a 'context' to be available for the next 'intent'.

## Concepts

The idea of Dialogflow is to design dialogs with the customer to give him the impression of an natural chat with the customer care agent.
For this reason, dialog flow provides a lot of in-build features to design such experience. These features are:

* NLP Features lear from given sentence and identify intents and information from the user sayings.
* Structured dialogs, where Dialogflow can perform a question and answer session for mandatory attributes without any further implementation.
* Direct support of stored context information for a certain time or request count
* Followup Intents which could be a direct answer to a intent
* Default Intents which can be used if the answer is not understandable
* Multiple responses to give the dialog a little more variance.

The development of a bot using Dialogflow is slightly different as the Development the Bot by yourself or using tool like claudia bot builder.
In this case the main Webhook which will be used by facebook will be the Dialogflow agent itself. The agent is running inside the Google cloud and will be configured via a web console.
The main communication will be done via. facebook messenger and Dialogflow. Only if an "intent" is fulfilled and all necessary information has been collected the Lambda containing the
Businesslogic will be called. In our case the Lambdas and the Database is inside the AWS Cloud.



![Dialogflow Archithekture](Dialogflow%20Archithekture.png)


### Agent

### Intent

### Entity

### Webhook

### Integration

## Pricing

Dialogflow is available in two editions: standard and enterprise. While the standard edition is free of any charge, the enterprise edition is charged on a per request basis. In return, it has a higher throughput (10 instead of 3 queries per second) and comes with an SLA. It is possible to increase the quota even more on request. However, the enterprise edition is based on the new Dialogflow V2 API which is currently in beta phase.

| Features | Standard Edition | Enterprise Edition |
| --- | --- | --- |
| Text Interaction | Free usage with unlimited requests | Unlimited requests at $0.002 per request |
| Voice Interaction | Free usage up to 1,000 requests per day with a maximum of 15,000 requests per month | Unlimited Google Cloud Speech requests at $0.0065 per request |
| Default quota for text queries | 3 queries per second (averaged over a minute) |10 queries per second (averaged over a minute) |
|Service Level Agreement | None | Coming soon (with the v1 GA release) |
| Support | Community support and via email | Eligible for Cloud Support packages with committed response times for supporting production applications |
| Terms of Service | Dialogflow ToS | Google Cloud Platform ToS |

## Problems During Development

 - Alle arbeiten an einem Lambda
 - Es kann aber immer nur eine Version deployed werden
 - Mehrere Versionen deployen funkioniert nicht, da wir dann auch mehrere DialogFlow Agents bräuchten
 - Ein Main Lambda und mehrere Intent-Lambdas würde das Problem lösen (was allerdings nur ein Problem aus der Entwicklung ist und nicht Produktionsrelevant. Im Gegenteil, zusätzliche Latency durch Lambda-Aufruf.)
 - Wie werden Daten aus einen Lambda als zum füllen der Varriablen zurück gegeben.
 - Wie kann man Intents schreiben die mit und ohne Context umgehen können?
 - Wie unterdrückt man ausgaben wenn eine Fehler zurück gegeben wird.
 - Keine möglichkeit Abfragen in die Antworten von Dialogflow zu geben.
