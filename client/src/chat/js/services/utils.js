(function () {

  function Utils ($timeout, $location, $anchorScroll) {
    var self = this;

    self.focus = function (id) {
      $timeout(function() {
        var element = $window.document.getElementById(id);
        if(element)
          element.focus();
      });
    };

    self.scrollDown = function (hash) {
      $location.hash(hash);
      $anchorScroll();
    };

    self.random = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    return self;
  }

  Utils.$inject = ['$timeout', '$location', '$anchorScroll'];
  angular.module('askMobile').service('Utils', Utils);
})();
