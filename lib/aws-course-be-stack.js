const { Stack, Duration } = require('aws-cdk-lib');
// const sqs = require('aws-cdk-lib/aws-sqs');
// const widget_service = require('../lib/widget_service');
const product_service = require('../lib/product_service');

class AwsCourseBeStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    new product_service.ProductService(this, "Products")

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AwsCourseBeQueue', {
    //   visibilityTimeout: Duration.seconds(300)
    // });
  }
}

module.exports = { AwsCourseBeStack }
