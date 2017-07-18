(function() {

  function chatMessage() {
    return {
        restrict: 'E',
        transclude: true,

        templateUrl: 'partials/chat_message.html',
    };
  }

  chatMessage.$inject = [];
  angular.module('askMobile').directive('chatMessage', chatMessage);

})();
