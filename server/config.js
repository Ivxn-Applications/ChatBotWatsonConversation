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
    //require('dotenv').config({ silent: true });
    var env_variables = require('node-env-file')(__dirname + '/credentials', {raise: false});
    cloudant = {
      username: env_variables.DB_USERNAME,
      password: env_variables.DB_PWD,
      url: env_variables.DB_HOST
    };

    conversation = {
      username: env_variables.CONVERSTATION_USER,
      password: env_variables.CONVERSTATION_PWD,
      url: env_variables.CONVERSTATION_URL
    };

    redis = {
      uri: env_variables.REDIS_URI
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
