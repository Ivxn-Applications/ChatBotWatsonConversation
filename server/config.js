/**
 * Provide a single object with credentials for both cloudant and conversation.
 * @param  {Object} appEnv Enviroment object provided by cfenv module 
 * @return {Object} config Both cloudant and conversation credentials
 */
module.exports = function config (appEnv) {
  var vcap = require('vcap_services'),
      cloudant = null,
      conversation = null;
      redis = null;

  if (appEnv.isLocal) {
    require('dotenv').config({ silent: true });
    
    cloudant = {
      username: process.env.DB_USERNAME,
      password: process.env.DB_PWD,
      url: process.env.DB_HOST
    };

    conversation = {
      username: process.env.CONVERSTATION_USER,
      password: process.env.CONVERSTATION_PWD,
      url: process.env.CONVERSTATION_URL
    };

    redis = {
      uri: process.env.REDIS_URI
    };

  } else {

    cloudant = vcap.getCredentials('cloudantNoSQLDB');
    conversation = vcap.getCredentials('conversation');
    redis = vcap.getCredentials('compose-for-redis');

  }

  return {
    cloudant: cloudant,
    conversation: conversation,
    redis: redis
  };
};
