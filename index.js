// work around intermediate CA issue
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var Promise = require('bluebird'),
    express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    watson = require('watson-developer-cloud'),
    cfenv = require('cfenv'),
    appEnv = cfenv.getAppEnv(),
    database = process.env.DATABASE || 'test_feedback',
    config = require('./server/config')(appEnv);

app.use(bodyParser.json());

/* ***************** Cloudant & conversation setup ***************** */
var cloudant = require('cloudant')({
  account: config.cloudant.username,
  password: config.cloudant.password,
  plugin:'promises'
}).db.use(database);
var cloudantConv = require('cloudant')({
  account: config.cloudant.username,
  password: config.cloudant.password,
  plugin:'promises'
}).db.use("conversations_records");
var conversation = watson.conversation({
  url: config.conversation.url,
  username: config.conversation.username,
  password: config.conversation.password,
  version_date: '2016-09-20',
  version: 'v1'
});
Promise.promisifyAll(conversation);
/* ***************** Auth setup **************** */
if (!appEnv.isLocal) { // Disable auth when running locally.
  require('./server/auth/')(app, appEnv, config);
  app.use(require('./server/auth/validator'));
}
/* ***************** Serve client app **************** */
app.use('/', express.static(__dirname + '/client/build/loader'));
app.use('/chat', express.static(__dirname + '/client/build/chat'));

/* ***************** APIs setup **************** */
require('./server/conversation')(app, appEnv, cloudant, conversation,cloudantConv);
require('./server/feedback')(app, cloudant);
require('./server/feedbackNegative')(app, cloudant);
require('./server/info')(app, appEnv);
require('./server/health')(app);
require('./server/socket')(io);
var monitoring = require("./server/monitoring/monitoringController.js");
var slack = require("./server/slack/slackController.js");

slack.initSlackService((status)=>{
  console.log(status);
  monitoring.initMonitoring((status)=>{
    console.log(status);
  })
});

http.listen(appEnv.port, function () {
  console.log('Mobile@IBM Chat Bot running: ' + appEnv.url);
});
