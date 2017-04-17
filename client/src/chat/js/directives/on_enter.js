(function () {

  function onEnter () {
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if(event.which === 13) {
            scope.$apply(function () {
                // scope.$eval(attrs.onEnter);
                scope[attrs.onEnter]();
            });
            event.preventDefault();
        }
      });
    };
  }

  onEnter.$inject = [];
  angular.module('askMobile').directive('onEnter', onEnter);

}());
