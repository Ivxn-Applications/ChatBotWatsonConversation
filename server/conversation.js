var utils = require('./utils');
var confidence = require('./data/confidence');
var WORKSPACE_ID = process.env.CONVERSATION_WORKSPACE_ID;
var fakeUser = require('./utils/fake_user');

module.exports = function (app, appEnv, cloudant, conversation, cloudantConv) {

  app.post('/api/message', function(req, res) {
    var user,
        device,
        payload = { workspace_id: WORKSPACE_ID, context: {}, input: {} };

    try {
      if (!req.session.refinedData) {
        req.session.refinedData = utils.buildUserObj(req.user._json);
        req.session.device = utils.mobileOrDesktop(req.user._json.userAgent);
      }

      user = req.session.refinedData;
      device = req.session.device;
    } catch (e) {
      // dev purposes
      if (appEnv.isLocal) {
        var fake = fakeUser();

        user = fake.user;
        device = fake.device;
      } else {
        res.status(500).json({
          message: 'Sorry, a problem was found while processing your information. Please try again.',
          error: 'Session data not found'
        });

        return;
      }
    }

    if (req.body) {
      if (req.body.input) {
        payload.input = req.body.input;
      }
      if (req.body.context) {
        // The client must maintain context/state
        payload.context = req.body.context;
      }
    }

    var response = {};

    conversation.messageAsync(payload)
    .then(function (result) {
      isOnDataBase(cloudantConv,result,(flag) =>{
        if(flag === true){
          retreiveDocCloudant(cloudantConv,result,(docAux)=>{
            var objAux ={
              _id: docAux._id,
              _rev: docAux._rev,
              worksapce_id: docAux.worksapce_id,
              conversation_id: docAux.conversation_id,
              text: docAux.text+"user: "+result['input'].text+" watson: "+result['output'].text
            };
            cloudantConv.insert(objAux);
          });
        }else{
         var data = {worksapce_id:WORKSPACE_ID, conversation_id:result["context"].conversation_id, text:"watson: "+result['output'].text};
         cloudantConv.insert(data);
        }
      });
      response = result;
      response.user = user;
      response.device = device;
      // console.log('DEVICE: ', response.device);
      if (response.context.feedback) {
        response.date = new Date().toISOString();

        return cloudant.insert(response, {include_docs: true});
      } else {
        return response;
      }
    })
    .then(function (result) {
      if (response.context.feedback) {
        if (result.ok) {
          response._rev = result.rev;
          response._id = result.id;
        }

        response.data = JSON.parse(JSON.stringify(response));
        response.feedback = true;
      } else {
        response.feedback = false;
      }

      // Check response confidence and treat it accordingly
      if (response.intents[0] && !response.context.ignore_confidence) {
        var responseConfidence = response.intents[0].confidence;

        if (responseConfidence >= confidence.rate.low && responseConfidence < confidence.rate.high) {
          response.lowConfidence = {
            text: confidence.text.medium,
            showResponse: true
          };
        } else if (responseConfidence < confidence.rate.low) {
          response.lowConfidence = {
            text: confidence.text.low,
            showResponse: false
          };
        } else {
          response.lowConfidence = null;
        }
      }

      response.output.text = response.output.text.join("\n").replace(/{name}/, response.user.name.split(' ')[0]);

      res.json(response);
    })
    .error(function (error) {
      res.status(500).json(error);
    });
  });

};
function isOnDataBase(cloudantConv,result, callback){
  cloudantConv.find({selector:{conversation_id:result["context"].conversation_id}}, function(er, result) {
      if (er) {
        throw er;
      }
      if(result.docs.length>0){
        callback(true);
      }
      else{
        callback(false);
      }
    });
}
function retreiveDocCloudant(cloudantConv,result,callback){
  cloudantConv.find({selector:{conversation_id:result["context"].conversation_id}}, function(er, result) {
      if (er) {
        throw er;
      }
      if(result.docs.length>0){
        callback(result.docs[0]);
      };
    });
}
