(function () {
    
    function inputBox() { 
      return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'partials/input_box.html',
      };
    }
    
    inputBox.$inject = [];
    angular.module('askMobile').directive('inputBox', inputBox);
})();