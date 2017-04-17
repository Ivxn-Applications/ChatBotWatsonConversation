/**
 * 
 * This module is for testing locally the app. Should NOT be used in production.
 * 
 */
var utils = require('./index');
var ssoDevJson;


module.exports = function () {
  var fakeUser = null;

  if (!ssoDevJson) {
    ssoDevJson = require('../data/john_doe');
  }

  return {
    user: utils.buildUserObj(ssoDevJson),
    device: utils.mobileOrDesktop(ssoDevJson.userAgent)
  };
};