//On start
module.exports = {
  initSlackService,
  sendingErrorMessage
}

var Slack = require('slack-node');
var slack;
var webhookUri =process.env.WEBHOOK_URI;

function initSlackService(callback){
  slack = new Slack();
  slack.setWebhook(webhookUri);
  console.log("ask-mobile-"+ process.env.SPACE +" STARTED");
  slack.webhook({
    username: "ask-mobile ("+ process.env.SPACE +")",
    text: "Status: aplication's started"
  }, function(err, response) {
    console.log(response);
  });
  callback("Slack Service Initialized");
}

function sendingErrorMessage(issueMessage){
  slack.webhook({
    username: "ask-mobile ("+process.env.SPACE+")",
    text: "Status: "+issueMessage
  }, function(err, response) {
    if (err)
      console.error("[INFO] An Error has ocurred sending data to Slack");
  });

}
