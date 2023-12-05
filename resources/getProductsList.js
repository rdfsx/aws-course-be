const { S3Client, ListObjectsCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({});

const mockedProducts = [
  {
    description: "Short Product Description1",
    id: "1",
    price: 24,
    title: "ProductOne",
  },
  {
    description: "Short Product Description7",
    id: "2",
    price: 15,
    title: "ProductTitle",
  },
  {
    description: "Short Product Description2",
    id: "3",
    price: 23,
    title: "Product",
  },
];

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

  return {
    statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*'
      },
    body: JSON.stringify(mockedProducts)
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
