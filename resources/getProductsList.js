const {DynamoDBClient} = require('@aws-sdk/client-dynamodb');
const {DynamoDBDocumentClient, ScanCommand} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const routeRequest = (lambdaEvent) => {
  if (lambdaEvent.httpMethod === "GET") {
    return handleGetRequest();
  }

  const error = new Error(
    `Unimplemented HTTP method: ${lambdaEvent.httpMethod}`,
  );
  error.name = "UnimplementedHTTPMethodError";
  throw error;
};

const handleGetRequest = async () => {
  let result = []

  const command = new ScanCommand({
    TableName: "products"
  });

  const response = await docClient.send(command);

  if (!response.Items) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: "Product not found" }),
          };
        }

  response.Items.forEach(function(item) {
        result.push(
            {
                description: item.description,
                id: item.id,
                price: Number(item.price),
                title: item.title
            }
        );
      });

  return {
    statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*'
      },
    body: JSON.stringify(result)
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
