(function () {
  function FeedbackNegative ($http, $q) {
  var self = this;

  self.save = function (message) {
    return $http.post('/api/feedbackNegative/save', message);
  };

  self.delete = function (message) {
    return $http.post('/api/feedbackNegative/delete', message.data);
  };

  return self;
}

FeedbackNegative.$inject = ['$http', '$q'];
angular.module('askMobile').service('FeedbackNegative', FeedbackNegative);
}());
