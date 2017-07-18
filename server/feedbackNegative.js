
module.exports = function (app, cloudant) {

  app.post('/api/feedbackNegative/save', function (req, res) {
    var comment = req.body;
    cloudant.get(comment.id)
    .then(function (body) {
      body.negativeFeedback = comment.feedbackNegative;
      return cloudant.insert(body);
    })
    .then(function (result) {
      res.json(result);
    },function (result) {
      res.json(result);
    });
  });

  app.post('/api/feedbackNegative/delete', function (req, res) {
    var comment = req.body;
    console.log('Request',comment);
    /*
    cloudant.destroy(comment._id, comment._rev)
    .then(function (result) {
      res.json(result);
    },function (result) {
      res.json(result);
    });
  });
*/
});

}
