module.exports = {
  initMonitoring,
}

var slackController = require("./../slack/slackController.js");

function initMonitoring(callback){
  process.on('uncaughtException', (err) => {
    console.error("Error!!!!!!!!!!!!!!!!!! ",err);
    slackController.sendingErrorMessage(err);
  });
  callback("Monitoring service Initialized");
}
