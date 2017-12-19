# Dialogflow Facebook Webhook

## Configuration

This lambda needs `dialogflow_webhook` set as an environment variable. It must point to the callback URL of the Facebook Messenger integration in Dialogflow.

Additionally `facebook_verify_token` must be set. The same value must be provided in Facebook when creating the webhook in the Facebook App.