(function () {

  function Feedback ($http, $q) {
    var self = this;

    self.save = function (message) {
      return $http.post('/api/feedback/save', message);
    };

    self.delete = function (message) {
      return $http.post('/api/feedback/delete', message.data);
    };

    return self;
  }

  Feedback.$inject = ['$http', '$q'];
  angular.module('askMobile').service('Feedback', Feedback);

}());
