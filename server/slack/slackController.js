module.exports = {
  initSlackService,
  sendingErrorMessage
}
var slackServices = require("./slackServices.js");

function initSlackService(callback){
  slackServices.initSlackService(callback);
}

function sendingErrorMessage(issueMessage){
  slackServices.sendingErrorMessage(issueMessage);
}
