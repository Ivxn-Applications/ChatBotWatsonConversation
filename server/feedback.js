
module.exports = function (app, cloudant) {

  app.post('/api/feedback/save', function (req, res) {
    var comment = req.body;

    cloudant.get(comment.id)
    .then(function (body) {
      body.feedback = comment.feedback;
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

    cloudant.destroy(comment._id, comment._rev)
    .then(function (result) {
      res.json(result);
    },function (result) {
      res.json(result);
    });
  });

};
