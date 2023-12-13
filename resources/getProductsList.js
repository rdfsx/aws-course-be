const AWS = require('aws-sdk');

AWS.config.update({
    region: "eu-north-1",
});

const ddb = new AWS.DynamoDB({});

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
  ddb.scan({TableName: 'products'}, function(err, data) {
    data.Items.forEach(function(item) {
        result.push(
            {
                description: item.description.S,
                id: item.id.S,
                price: Number(item.price.N),
                title: item.title.S
            }
        );
      });
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
