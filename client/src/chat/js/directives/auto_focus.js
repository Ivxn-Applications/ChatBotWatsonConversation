(function () {

  function autoFocus($timeout) {
    return {
      restrict: 'A',
      scope: {
        autoFocus: "="
      },
      link: function($scope, $element, attrs) {
        $scope.$watch("autoFocus", function(currentValue, previousValue) {
          if (currentValue) {
            $timeout(function () {
              $element[0].focus();
            }, 0);
          }
        });

        $element[0].focus();
      }
    };
  }

  autoFocus.$inject = ['$timeout'];
  angular.module('askMobile').directive('autoFocus', autoFocus);

}());
