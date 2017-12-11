# Facebook Chatbot with AI

We have analyzed three different Frameworks/Tools to add NLP to our bots and to enable conversational dialogs.

Wit.AI is a messenger-agnostic NLP Framework of Facebook. Hence, it has a deep integration in the messaging feature. Incoming messages are redirected to wit.ai which does some NLP to identify so called 'intents'. It then enriches the original message with any recognized 'intent' and some 'confidence' value (0.00 to 1.00). The enriched message is then passed to the webhook. Wit.ai does not provide any conversion context itself, nor does it provide any conversational feature at all. It just does an analysis of the incoming message.

Dialogflow by Google is more feature rich than wit.ai. It provides a conversational state and therefore allows dialog communication between the user and the Dialogflow agent. Dialogflow exchanges messages to some messenger directly. In addition to Facebook messenger it supports Slack, Alexa and many others. Since Dialogflow handles the conversation itself, it either recognizes an 'intent' or it does not (and provides a default respsone). Within an 'intent' there can exist 'entities'. Those are business values that must be provided by the user. The 'entities' can be stored in a 'context' to be available for the next 'intent'.

AWS Lex is very similar to Dialogflow. It also communicates with some messenger directly. It has support for Facebook, Kik, Slack, and Twilio. Lex as well tries to identifiy an 'intent' in the user's message. If it fails, it provides a default message. The business values within an 'intent' are called 'slot types' in Lex. However, Lex does not provide some sort of state out-of-the-box within a conversation. Meaning, 'slot-types' are lost after an 'intent' is completed. Furthermore, Lex currently supports English language only.

While wit.ai is just a plugin to take advantage of NLP, Dialogflow and Lex provide a tool to really build a conversational bot.

The following chapters take a deeper look at each framework.

1. [Wit.AI](wit_ai)
2. [Dialogflow](dialogflow)
3. [AWS Lex](lex)