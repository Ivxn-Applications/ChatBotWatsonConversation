(function() {
    
    function chatMessages() { 
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'partials/chat_messages.html',
        };
    }

    chatMessages.$inject = [];
    angular.module('askMobile').directive('chatMessages', chatMessages);
})();