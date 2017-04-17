(function () {

  function WatsonConversation ($http, $q) {
    var self = this,
        payload = { context: {}, input: {} };

    self.answer = function (text) {
      if (text) {
        payload.input.text = text;
      }

      var deferred = $q.defer();

      var opts = {
        url: '/api/message',
        method: 'POST',
        headers: {
          'Content-Type':'application/json'
        },
        data: JSON.stringify(payload)
      };

      $http(opts)
      .success(function (result) {
        // console.log(result);
        payload.context = result.context;
        deferred.resolve({
          intents: result.intents,
          text: result.output.text,
          feedback: result.feedback,
          data: result.data,
          user: result.user,
          lowConfidence: result.lowConfidence
        });
      })
      .error(deferred.reject);

      return deferred.promise;
    };

    return self;
  }

  WatsonConversation.$inject = ['$http', '$q'];
  angular.module('askMobile').service('WatsonConversation', WatsonConversation);

}());
