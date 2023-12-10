// Load the AWS SDK
var AWS = require('aws-sdk');
const uuid = require("uuid");

// Set region
AWS.config.update({
    region: "us-west-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create the DynamoDB service client
var ddb = new AWS.DynamoDB({});

// Data to insert into 'products' and 'stocks' tables
const productsAndStocksData = [
    {
        productId: uuid.v4(),
        title: 'Product1',
        description: 'Product 1 description',
        price: "10",
        count: "15",
    },
    {
        productId: uuid.v4(),
        title: 'Product2',
        description: 'Product 2 description',
        price: "20",
        count: "20",
    }
];

productsAndStocksData.forEach(dataItem => {
    // Parameters for products table
    let productsParams = {
        TableName : 'products',
        Item: {
            id: {S: dataItem.productId},
            title: {S: dataItem.title},
            description: {S: dataItem.description},
            price: {N: dataItem.price}
        }
    };

    // Call DynamoDB to add the item to the table
    ddb.putItem(productsParams, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", productsParams.Item);
        }
    });

    // Parameters for stocks table
    let stocksParams = {
        TableName : 'stocks',
        Item: {
            product_id: {S: dataItem.productId},
            count: {N: dataItem.count}
        }
    };

    // Call DynamoDB to add the item to the table
    ddb.putItem(stocksParams, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", stocksParams.Item);
        }
    });
});