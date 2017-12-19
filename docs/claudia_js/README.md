# Claudia JS

Claudia describes itself on [its homepage](https://github.com/claudiajs/claudia) as follows.

> Claudia makes it easy to deploy Node.js projects to AWS Lambda and API Gateway. It automates all the error-prone deployment and configuration tasks and sets everything up the way JavaScript developers expect out of the box.

The three authors of Claudia are heavily active on https://gitter.im/claudiajs/claudia. From our experience you get very quick feedback.

## Commandline Tool

### Install

First you need to install the claudia node package. It provides a command line tool to set up AWS infrastructure and deploy lambda functions. *Note: this will install claudia globally, such that the following commands work out-of-the-box on the command line. However, we install claudia as a local node package (see [Claudia Scripts](#claudia-scripts)).*

`$ npm install claudia -g`

Claudia uses the standard javascript aws-sdk. Therefore, before using claudia, you must supply your AWS credentials in a config file `~/.aws/credentials`.

```javascript
[default]
aws_access_key_id = [ACCESS_KEY]
aws_secret_access_key = [SECRET_ACCESS_KEY]
```

This sets the credentials for your default profile. However, you can choose any profile name you want. In this case you must specify the profile when running claudia, for example:

`$ claudia update --profile myProfile`

### Deploy a Lambda

To deploy a lambda on AWS simply call

`$ claudia create --region eu-central-1 --handler index.handler`

The region and handler parameters are required.

The region specifies the AWS region where claudia should deploy the lambda. The handler points to the actual lambda function. Its syntax is *[module].[function]*. For example, given a file `index.js` which exports a function `handler` results in `index.handler`.

The lambda function must have the following signature. The third parameter `callback` is optional. Use it to return information to the caller.

```javascript
exports.handler = (event, context, caller) => {
   ...
}
```

To update a lambda function call

`$ claudia update`

Based on the `claudia.json` file it knows which lambda in AWS to update.

### Deploy a Lambda with an API Gateway

A lambda alone is not reachable from the outside world. Therefore, we introduce an HTTP API Gateway. All requests made to the Gateway are passed on to the lambda. In our lambda we need to define the endpoints and handler to listen on those. The example below defines one POST endpoint with resource `webhook` and a corresponding handler. The handler looks the same like the exported lambda function before.

```javascript
const ApiBuilder = require('claudia-api-builder')
const api = new ApiBuilder()

const myHandler = (event, context, caller) => {
   ...
}

api.post('/webhook', myHandler)

module.exports = api
```

This command creates a new API Gateway and the lambda in AWS. Given, that our javascript file is named `index.js`.

`$ claudia create --region eu-central-1 --api-module index`

Here we replace `--handler` by `--api-module`. That means we no longer deploy a simple lambda function but one that is available via HTTP (via API Gateway).

The exported `ApiBuilder` has a method

`self.proxyRouter = function (event, context, callback)`

Hence, Claudia creates a lambda with handler `index.proxyRouter`. The `proxyRouter` then redirects the incoming request to our correct handler depending on the resource url.

### Setup a Chatbot

To set up a chatbot two claudia commands are required. First, set up the AWS infrastructure (API Gateway and lambda), and second, configure the bot.

 However, this time we change the lambda signature as follows.

```javascript
module.exports = botBuilder(request => {
       ...
    }, 
    {platforms: ['facebook']}
)
```
The `botBuilder` returns an `API Builder` as described in the previous section. Moreover, the inline function is the handler for incoming requests. This method may return a simple string (or an array of it), as well as platform specific messages. The `botBuilder` in turn takes this value the sends the response message.

Again we first create the infrastructure with

`$ claudia create --region eu-central-1 --api-module index`

Afterwards, we configure our bot to make it 'Facebook aware'. Basically, the command will ask for Facebook keys which are stored as variables in the API Gateway. All incoming requests are enriched by those variables. Hence, they are available in the lambda function. 

`$ claudia update --configure-fb-bot`

*TBD: FB Access Token*

*TBD: Page Secret*

### Teardown

Claudia supports the user tearing down the created infrastructure. Based on the `claudia.js` file it knows what was created in AWS. To teardown everything simply call:

`$ claudia destroy`

### Claudia Scripts

To not pollute the user's global computer space we install claudia as a local dependency.
For convenience, we create some scripts in the `package.json`. For example, we have:

```
{
    ...

    "scripts": {
        "create": "claudia create --region eu-central-1--api-module index"
    }
}
```
So we can execute

`$ npm run create`

instead of

`$ ./node_modules/.bin/claudia create --region eu-central-1--api-module index`

Typically, we have three scripts defined: create, update and destroy.

### Pitfalls

Working with multiple developers on the same AWS setup with Claudia may cause pain. It is caused due to the local *BLA BLA BLA* and the `claudia.json` file. If someone changes the AWS infrastructure one has to immediately push the newest (or deleted) `claudia.json` into the repository. Everyone else has to always get the up-to-date version first, before working on the infrastructure. 

One problem is, for example, if someone destroys the AWS infrastructure, and someone else wants to recreate it, but still has a local copy of `claudia.json`, this will not work. Due to the fact that `claudia.json` exists, claudia assumes the AWS infrastructure is still available.

Another problem is caused by the recreation of an API Gateway. Other than lambdas, which always get a fixed name, an API Gateway gets a random name assigned when created. Updating or deleting the API Gateway with an outdated `claudia.json` is not possible.

## Javascript Dependencies

### Install

`$ npm install claudia-api-builder -S`

`$ npm install claudia-bot-builder -S`

### Api-Builder

*TBD*

### Bot-Builder

*TBD*