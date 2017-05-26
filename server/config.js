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

    console.log("running locally");
    require('dotenv').config({ silent: true });
    credentials = require('node-env-file')(__dirname + '/credentials', {raise: false});
    cloudant = {
      username: credentials.DB_USERNAME,
      password: credentials.DB_PWD,
      url: credentials.DB_HOST
    };

    conversation = {
      username: credentials.CONVERSTATION_USER,
      password: credentials.CONVERSTATION_PWD,
      url: credentials.CONVERSTATION_URL
    };

    redis = {
      uri: credentials.REDIS_URI
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
