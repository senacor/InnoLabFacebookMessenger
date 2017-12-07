# AWS Lambda
![aws_lambda_function](aws_lambda_function.png "AWs Lambda function")

The actual business logic of the bot will be places as lambda function. The lambda function can be written in different programming languages:

* Node.js
* Python
* C#
* Java

We use Node.JS for our bot. To eliminate the boiler blade code for communicating with facebook, we use a facebook bot lib from claudia.

To be allowed to create and run the lambda function you have to fulfill the following rules:

* The use which has to administrate the infrastructure need the rights to create, change and delete them
* The single components need the rights to access necessary AWS components.