const { Construct } = require("constructs");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const lambda = require("aws-cdk-lib/aws-lambda");
const s3 = require("aws-cdk-lib/aws-s3");


class ProductService extends Construct {
    constructor(scope, id) {
        super(scope, id);

        const bucket = new s3.Bucket(this, "ProductStore");

        const listHandler = new lambda.Function(this, "ProductsHandler", {
          runtime: lambda.Runtime.NODEJS_18_X,
          code: lambda.Code.fromAsset("resources"),
          handler: "getProductsList.handler",
        });
        const detailHandler = new lambda.Function(this, "ProductHandler", {
            runtime: lambda.Runtime.NODEJS_18_X,
          code: lambda.Code.fromAsset("resources"),
          handler: "getProductsById.handler",
        });

        bucket.grantReadWrite(listHandler); // was: handler.role);
        bucket.grantReadWrite(detailHandler);

        const api = new apigateway.RestApi(this, "products-api", {
          restApiName: "Product Service",
          description: "This service serves products.",
          defaultCorsPreflightOptions: {
            allowHeaders: ["*"],
            allowOrigins: ["*"],
            allowMethods: ["*"],
          },
        });

        const getProductsListIntegration = new apigateway.LambdaIntegration(listHandler, {
          requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });
        const getProductsByIdIntegration = new apigateway.LambdaIntegration(detailHandler, {
          requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });

        const products = api.root.addResource("products");
        products.addMethod("GET", getProductsListIntegration); // GET /

        const product = products.addResource("{product_id}");
        product.addMethod("GET", getProductsByIdIntegration);

    }
}

module.exports = { ProductService }