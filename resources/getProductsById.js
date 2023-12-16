const {DynamoDBClient} = require('@aws-sdk/client-dynamodb');
const {DynamoDBDocumentClient, GetCommand} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);


const routeRequest = (lambdaEvent) => {
  if (lambdaEvent.httpMethod === "GET") {
    return handleGetRequest(lambdaEvent);
  }

  const error = new Error(
    `Unimplemented HTTP method: ${lambdaEvent.httpMethod}`,
  );
  error.name = "UnimplementedHTTPMethodError";
  throw error;
};

const handleGetRequest = async (event) => {
    const productId = event.pathParameters.product_id;

    const command = new GetCommand({
      TableName: "products",
      Key:{id: productId},
    });

    const productFound = await docClient.send(command);

    if (!productFound) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: "Product not found" }),
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
