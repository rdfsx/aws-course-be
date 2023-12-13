// Load the AWS SDK
const AWS = require('aws-sdk');
const uuid = require("uuid");

// Set region
AWS.config.update({
    region: "eu-north-1",
    // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create the DynamoDB service client
const ddb = new AWS.DynamoDB({});

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

    // // Call DynamoDB to add the item to the table
    // ddb.putItem(productsParams, function(err, data) {
    //     if (err) {
    //         console.log("Error", err);
    //     } else {
    //         console.log("Success", productsParams.Item);
    //     }
    // });

    // Parameters for stocks table
    let stocksParams = {
        TableName : 'stocks',
        Item: {
            id: {S: uuid.v4()},
            product_id: {S: dataItem.productId},
            count: {N: dataItem.count}
        }
    };

    // Call DynamoDB to add the item to the table
    // ddb.putItem(stocksParams, function(err, data) {
    //     if (err) {
    //         console.log("Error", err);
    //     } else {
    //         console.log("Success", stocksParams.Item);
    //     }
    // });
    // ddb.scan({TableName: 'products'}, function(err, data) {
    //   if (err) {
    //     console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    //   } else {
    //     // print all the movies
    //     // console.log("Scan succeeded.");
    //     data.Items.forEach(function(movie) {
    //       console.log(
    //           {
    //               description: movie.description.S,
    //               id: movie.id.S,
    //               price: Number(movie.price.N),
    //               title: movie.title.S
    //           }
    //       );
    //     });
    //   }
    // });

    ddb.getItem({TableName: 'products', Key:{id: {S:'84c675e3-2d34-4bd1-9ec1-bb2a2c3212db'}}}, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
});