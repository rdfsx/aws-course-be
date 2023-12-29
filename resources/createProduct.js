const {DynamoDBClient} = require('@aws-sdk/client-dynamodb');
const {DynamoDBDocumentClient, GetCommand, TransactWriteCommand} = require('@aws-sdk/lib-dynamodb');
const uuid = require("uuid");

const client = new DynamoDBClient({region: "eu-north-1"});
const docClient = DynamoDBDocumentClient.from(client);


const routeRequest = (lambdaEvent) => {
  if (lambdaEvent.httpMethod === "POST") {
    return handlePostRequest(lambdaEvent);
  }

  const error = new Error(
    `Unimplemented HTTP method: ${lambdaEvent.httpMethod}`,
  );
  error.name = "UnimplementedHTTPMethodError";
  throw error;
};

const handlePostRequest = async (event) => {
    const body = event.body;
    let product = JSON.parse(body);

    const command = new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: "products",
                Item: {
                  id: uuid.v4(),
                  title: product.title,
                  description: product.description,
                  price: product.price,
                  count: product.count,
                },
              },
            },
            {
              Put: {
                TableName: "stocks",
                Item: {
                    id: uuid.v4(),
                    product_id: product.productId,
                    count: product.count,
                },
              },
            },
          ],
        });

    const productCreated = await docClient.send(command);

    if (!productCreated) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: "Product not created" }),
          };
        }

    return {
        statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*'
          },
        body: JSON.stringify(productFound)
      };
};

const buildResponseBody = (status, body, headers = {}) => {
  return {
    statusCode: status,
    headers,
    body,
  };
};

const handler = async (event) => {
  try {
    return await routeRequest(event);
  } catch (err) {
    console.error(err);

    if (err.name === "MissingBucketName") {
      return buildResponseBody(400, err.message);
    }

    if (err.name === "EmptyBucketError") {
      return buildResponseBody(204, []);
    }

    if (err.name === "UnimplementedHTTPMethodError") {
      return buildResponseBody(400, err.message);
    }

    return buildResponseBody(500, err.message || "Unknown server error");
  }
};

module.exports = { handler }
