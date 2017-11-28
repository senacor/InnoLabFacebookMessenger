# Innolab: Facebook Chatbots

This repository contains two chatbots. One more [advanced chatbot](./claudia_bot/README.md) built with [claudia-bot-builder](https://github.com/claudiajs/claudia-bot-builder) and [one more basic](./bare-metal_bot/README.md) built without any bot-framework.
The more advanced Claudia.js chatbot demonstrates how to interact with Facebook users using AI, authentication and your own business logic. The more basic chatbot demonstrates how to create a Facebook chatbot backend without any framework wrapping and hiding all the magic magic.

Both bots are deployed to AWS using AWS lambda and [claudia-api-builder](https://github.com/claudiajs/claudia-api-builder) for deployment.

## Documentation

1. [AWS Infrastructure](docs/aws_infrastructure)
2. [Setup Facebook Page and App](docs/setup_facebook)
3. [POC 1 - Facebook Chatbot using Claudia.js in 5 Minutes](docs/facebook_chatbot_with_claudia_js_in_five_minutes)
4. [POC 2 - Bare metal Facebook Chatbot](docs/bare_metal)
