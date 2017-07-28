
module.exports = function (app, cloudant) {

  app.post('/api/feedback/save', function (req, res) {
    var comment = req.body;
    console.log(comment);
    cloudant.get(comment.id)
    .then(function (body) {
      body.feedback = comment.feedback;
      console.log("EL cuerpo: ",body);
      if (body.feedback == "positive"){
        body.reviewed = "reviewed";
      }
      return cloudant.insert(body);
    })
    .then(function (result) {
      res.json(result);
    },function (result) {
      res.json(result);
    });
  });

  app.post('/api/feedback/delete', function (req, res) {
    var comment = req.body;
    console.log(comment);
    cloudant.destroy(comment._id, comment._rev)
    .then(function (result) {
      res.json(result);
    },function (result) {
      res.json(result);
    });
  });

};
