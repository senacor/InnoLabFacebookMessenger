# Innolab: Facebook Chatbots

This repository contains two chatbots. One more [advanced chatbot](./claudia_bot/README.md) built with [claudia-bot-builder](https://github.com/claudiajs/claudia-bot-builder) and [one more basic](./bare-metal_bot/README.md) built without any bot-framework.
The more advanced Claudia.js chatbot demonstrates how to interact with Facebook users using AI, authentication and your own business logic. The more basic chatbot demonstrates how to create a Facebook chatbot backend without any framework wrapping and hiding all the magic magic.

Both bots are deployed to AWS using AWS lambda and [claudia-api-builder](https://github.com/claudiajs/claudia-api-builder) for deployment.

## Goals

We want to implement a chatbot for a fake company called Digital Logistic, which helps their customer tracing and rerouting their parcels.

### Iterations

1. [Digital Logistics 1](./digital_logistics_01): Parse user input and respond with static message containing images and text if it contains a string "status" and any 8-digit number.
2. [Digital Logistics 2](./digital_logistics_02): Authenticate users

## Documentation

1. [AWS Infrastructure and Tools](docs/aws_infrastructure_tools)
2. [Pages and Apps](docs/pages_and_apps)
3. [Setup Facebook Page and App](docs/setup_facebook)
4. [Facebook chatbot basics](docs/fb_chatbot_basics)
5. [POC 0 - Bare metal Facebook Chatbot](docs/bare_metal)
6. [POC 1 - Facebook Chatbot using Claudia.js in 5 Minutes](docs/facebook_chatbot_with_claudia_js_in_five_minutes)
7. [POC 2 - Facebook Chatbot mit Login und Push Notifications](docs/facebook_chatbot_with_login_and_push_notifications) still TODOs!
8. [POC 3 - Facebook Chatbot with AI](docs/facebook_chatbot_with_ai)