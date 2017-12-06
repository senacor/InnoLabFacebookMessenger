# DynamoDB

We use AWS's DynamoDB to track the parcel's status, as well as storing user information. There is an excellent blog article called ["Should you use DynamoDB?"](https://dev.to/mushketyk/should-you-use-dynamodb-5m5) describing what DynamoDB is, how the data model looks like and how you can interact with it. TL;DR: DynamoDB is a NoSQL database, having properties of key/value stores as well as of document-orientated stores. As it's part of AWS it's serverless, what means you pay as you use and don't have to worry about infrastructure and operations. It is fast: less then 10ms for a request within the same region. On the other hand it can be quiet confusing how to set mandatory indices on your data. Have a look at the blog article above if you are interested.

## How we use DynamoDB

During the [Facebook linking process](./../facebook_chatbot_with_login_and_push_notifications) we store and delete so called authorization tokens and retrieve users by different queries. We use [Amazon's official Node.js SDK](https://aws.amazon.com/de/sdk-for-node-js/) in combination with [Amazon lab's DynamoDB Document SDK](https://www.npmjs.com/package/dynamodb-doc) which abstracts some low-level operations, for all operations.

We perform three different operations on the DynamoDB:
- `query` for retrieving data by an indexed value. If you don't have the sort key of the object you want to retrieve at your hand, you can use query and only pass the partition key for this operation. It will take longer then retrieving an object by partition and sort key with a get operation, but you might not have both keys at your hand.
    ```
    const params = {
        TableName: 'digital_logistics_customer',
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :hkey',
        ExpressionAttributeValues: {
            ':hkey': email
        }
    }

    docClient.query(params, (err, data) => {
        // ...
    })
    ```
    As you can see we query user's by their email. Since the field email is not the default index (customer id is!), we explicitly need state the index to use.
- `scan` for retrieving data by not indexed values. In the worst case scan has to check each database entry for the query to fit. Although scan is an expensive (real money you pay to AWS and time - expensive) operation and multiple indices can be created in order to perform a query or a get operations instead, it might be reasonable to use scan. This can be the case if the operation is not runtime critical, since AWS will bill you for creating indices some $ a month as well.
    ```
    const params = {
        TableName: 'digital_logistics_customer',
        ExpressionAttributeValues: {
            ':authorization_code': authCode
        },
        FilterExpression: 'authorization_code = :authorization_code'
    }

    docClient.scan(params, (err, data) => {
        // ...
    })
    ```
    You could also combine multiple `FilterExpressions` [as described in the documentation](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html)
- `updateItem` for updating and removing values. We only update single rows from within our system, so there is no need of one of the other change methods.
    ```
    const params = {
        TableName: 'digital_logistics_customer',
        Key: {
            'email': user.email,
            'customer_id': user.customer_id
        },
        UpdateExpression: 'set authorization_code = :r',
        ExpressionAttributeValues: {
            ':r': 'a-random-auth-code'
        },
        ReturnValues: 'ALL_NEW'
    }

    docClient.updateItem(params, (err, data) => {
        // ...
    })
    ```
    This is a simple update operation. We use update operations to delete the auth code again as well, since you cannot set empty strings once a field had a value. The params object looks like this
    ```
    const params = {
        TableName: 'digital_logistics_customer',
        Key: {
            'email': user.email,
            'customer_id': user.customer_id
        },
        UpdateExpression: `remove authorization_code`
    }
    ```