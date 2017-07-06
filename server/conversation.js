var utils = require('./utils');
var confidence = require('./data/confidence');
var WORKSPACE_ID = process.env.CONVERSATION_WORKSPACE_ID;
var fakeUser = require('./utils/fake_user');
var globalDate = new Date().toISOString();
var gloabalUser;
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
      gloabalUser=user;
    } catch (e) {
      // dev purposes
      if (appEnv.isLocal) {
        var fake = fakeUser();

        user = fake.user;
        gloabalUser =user;
        console.log(user);
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
      if(result['output'].nodes_visited[0]==="node_2_1491578229155")
        globalDate = new Date().toISOString();
      isOnDataBase(cloudantConv,result,(flag) =>{
        console.log("Date",globalDate);
        if(flag === true){
          retreiveDocCloudant(cloudantConv,result,(docAux)=>{
            var objAux ={
              _id: docAux._id,
              _rev: docAux._rev,
              worksapce_id: docAux.worksapce_id,
              conversation_date: docAux.conversation_date,
              text:docAux.text+"<p><br/><strong>USER:</strong> "
            };
            retreiveDataWithoutBR(result['input'].text,(textFixed)=>{
              objAux.text=objAux.text+textFixed+"</p>"+"<br/><p><strong>WATSON:</strong>  ";
              retreiveDataWithoutBR(result['output'].text,(textFixed)=>{
                objAux.text=objAux.text+textFixed+"</p>";
                cloudantConv.insert(objAux);
              });
            });
          });
        }else{
         var data = {worksapce_id:WORKSPACE_ID, conversation_date:globalDate, text:"<p><strong>WATSON:</strong> "};
         retreiveDataWithoutBR(result['output'].text,(textFixed)=>{
           console.log("closer to insert");
           data.text=data.text+textFixed+"</p>";
           cloudantConv.insert(data);
         });
        }
      });
      response = result;
      response.user={country:""};
      response.user.country = user.country;
      response.device = device;
      // console.log('DEVICE: ', response.device);
      if (response.context.feedback) {
        response.date = globalDate;
        console.log("User data to be inserted: ",response.user);
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
      response.output.text = response.output.text.join("\n").replace(/{name}/, user.name.split(' ')[0]);
      response.user["id"]=gloabalUser.id;
      res.json(response);
    })
    .error(function (error) {
      res.status(500).json(error);
    });
  });

};
function isOnDataBase(cloudantConv,result, callback){
  cloudantConv.find({selector:{conversation_date:globalDate}}, function(er, result) {
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
  cloudantConv.find({selector:{conversation_date:globalDate}}, function(er, result) {
      if (er) {
        throw er;
      }
      if(result.docs.length>0){
        callback(result.docs[0]);
      };
    });
}
function retreiveDataWithoutBR(text,callback){
  if(typeof(text)==="object"){
    text=text[0];
  }
  while (text.includes("<br/>")||text.includes("</br>")) {
    text = text.replace("<br/>","");
    text = text.replace("</br>","");
  }
  callback (text);
}
