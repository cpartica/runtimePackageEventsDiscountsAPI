/* 
* <license header>
*/

/**
 * This is a sample action showcasing how to access an external API
 *
 * Note:
 * You might want to disable authentication and authorization checks against Adobe Identity Management System for a generic action. In that case:
 *   - Remove the require-adobe-auth annotation for this action in the manifest.yml of your application
 *   - Remove the Authorization header from the array passed in checkMissingRequestInputs
 *   - The two steps above imply that every client knowing the URL to this deployed action will be able to invoke it without any authentication and authorization checks against Adobe Identity Management System
 *   - Make sure to validate these changes against your security requirements before deploying the action
 */

const stateLib = require('@adobe/aio-lib-state')
const { Core } = require('@adobe/aio-sdk')


// main function that will be executed by Adobe I/O Runtime
const main = async params => {
  const state = await stateLib.init();
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });
  const skus = params.skus;
  let products = [];

  let body = { data: {} };
  if (!skus) {
    return {
      statusCode: 404,
      body: { error: 'expecting a skus parameter' }
    }
  }
  logger.info(params);

  const skuArray = skus.split(',');
  for (const skuElement of skuArray) {
    const storedData = await state.get(skuElement);
    if (storedData) {
      products.push(storedData);
    }
  }
  if (!body.error) {
    body = { data: products };
  }

  return {
    statusCode: 200,
    body: body
  }
};

exports.main = main
