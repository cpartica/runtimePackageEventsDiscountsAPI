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

const fetch = require('node-fetch')
const stateLib = require('@adobe/aio-lib-state')
const { Core } = require('@adobe/aio-sdk')

// main function that will be executed by Adobe I/O Runtime
const main = async params => {
  const state = await stateLib.init();
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })
  const COMMERCE_URL = 'https://mcstaging.api-mesh.dummycachetest.com/graphql';
  logger.info(params)

  const sku = params.data.value.sku;

  const eventProduct = {
    "name": params.data.value.name,
    "price": params.data.value.price
  }

  const graphqlQuery = {
    query: `{
    products(filter: {sku: {eq: "${sku}"}}) {
      items {
        name
        sku
        special_price
        price_range {
          minimum_price {
            discount { percent_off }
            regular_price { value }
            final_price { value }
          }
        }
      }
    }
  }`,
    variables: {}
  };

  const gqlResponse = await fetch(COMMERCE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(graphqlQuery)
  });

  if (!gqlResponse.ok) {
    logger.info(`GraphQL Network response was not ok: ${gqlResponse.statusText}`);
    throw new Error(`GraphQL Network response was not ok: ${gqlResponse.statusText}`);
  }

  const jsonGqlResponse = await gqlResponse.json();

  // Handle the case where GraphQL returns errors
  if (jsonGqlResponse.errors) {
    logger.info('GraphQL Errors:', jsonGqlResponse.errors);
    throw new Error('GraphQL query failed!');
  }

  let productExtraData = {};
  try {
    productExtraData = jsonGqlResponse.data.products.items[0];
  } catch (e) {
    productExtraData = {};
  }
  state.put(sku, { event: eventProduct, product: productExtraData });

  const storedData = await state.get(sku);

  return {
    statusCode: 200,
    body: storedData
  }
};

exports.main = main
