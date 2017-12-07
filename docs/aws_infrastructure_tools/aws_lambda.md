# AWS Lambda
![aws_lambda_function](aws_lambda_function.png "AWs Lambda function")

The actual business logic of the bot is implemented as a lambda function. The lambda function can be written in different programming languages:

* Node.js
* Python
* C#
* Java

We use Node.JS for our bot. To eliminate the boilerplate code for communicating with facebook, we use a facebook bot lib called claudia.js.

To be allowed to create and run the lambda function you have to fulfill the following rules:

* The user which has to administrate the infrastructure need rights to create, change and delete it
* The single components need rights to access necessary AWS components.