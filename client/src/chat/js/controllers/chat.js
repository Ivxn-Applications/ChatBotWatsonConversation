(function () {

  function ChatController ($scope, $timeout, WatsonConversation, Feedback, ChatMessage, Utils) {
    $scope.messages = [];
    $scope.bootstraped = false;
    $scope.block = { input: false, feedback: false };
    var feedbacking = false;
    var user = null;

    $scope.feedback = function (message, type) {
      if (feedbacking || message.feedback === type) {
        return;
      }

      feedbacking = true;
      message.feedback = type;

      Feedback.save({id: message.data["_id"], feedback: message.feedback })
      .success(function (result) {
        console.log(result);
        message.feedback = type;
        message.data._id = result.id;
        message.data._rev = result.rev;

        feedbacking = false;
        $scope.block.input = false;
        $scope.focus = true;
        $scope.block.feedback = false;
      })
      .error(console.error);
    };

    $scope.getAnswer = function () {
      $scope.focus = true;
      if (!$scope.input || $scope.input === "") {
        return;
      }

      var input = $scope.input;

      $scope.messages.push(ChatMessage.user(input, user.id));

      $scope.input = "";
      Utils.scrollDown('message-' + ($scope.messages.length - 1));

      $timeout(function  () {
        $scope.watsonIsTyping = true;
        callWatson(input, true);
      },
        Utils.random(300,1000)
      );
    };

    function callWatson (input, timeout) {
      $scope.focus = false;
      $scope.block.input = true;

      function success (response) {
        $scope.bootstraped = true;
        if (!user) {
          //TODO workaround, fix
          $scope.userPhoto = 'http://faces.tap.ibm.com:10000/image/' + response.user.id;
          user = {
            name: response.user.id,
            id: response.user.id
          };
        }

        // checking and treating confidence
        if (response.lowConfidence && response.lowConfidence.showResponse) {

          $timeout(function () {
            $scope.messages.push(ChatMessage.lowConfidence(response.lowConfidence));

            $timeout(function functionName() {
              $scope.messages.push(ChatMessage.watson(response));

              if (response.feedback) {
                $scope.messages.push(ChatMessage.feedback(response));
                $scope.block.feedback = true;
              } else {
                $scope.block.input = false;
                $scope.focus = true;
              }

              Utils.scrollDown('message-' + ($scope.messages.length - 1));

              $scope.watsonIsTyping = false;

            }, Utils.random(600,1500));
          }, Utils.random(300,1000));


        } else if (response.lowConfidence && !response.lowConfidence.showResponse) {

          $timeout(function () {
            $scope.messages.push(ChatMessage.lowConfidence(response.lowConfidence));

            if (response.feedback) {
              $scope.messages.push(ChatMessage.feedback(response));
              $scope.block.feedback = true;
            } else {
              $scope.block.input = false;
              $scope.focus = true;
            }

            Utils.scrollDown('message-' + ($scope.messages.length - 1));
            $scope.watsonIsTyping = false;
          }, Utils.random(300,1000));

        } else {

          $timeout(function () {
            $scope.messages.push(ChatMessage.watson(response));

            if (response.feedback) {
              $scope.messages.push(ChatMessage.feedback(response));
              $scope.block.feedback = true;
            } else {
              $scope.block.input = false;
              $scope.focus = true;
            }

            Utils.scrollDown('message-' + ($scope.messages.length - 1));

            $scope.watsonIsTyping = false;

          }, timeout ? Utils.random(300,1000) : 0);

        }
      }

      function fail (error) {
        $scope.watsonIsTyping = false;
        $scope.focus = true;
        console.log(error);
      }

      WatsonConversation.answer(input).then(success,fail);
    }

    function init() {
      callWatson('',false);
    }

    $timeout(init);
  }

  ChatController.$inject = ['$scope', '$timeout', 'WatsonConversation', 'Feedback', 'ChatMessage', 'Utils'];
  angular.module('askMobile').controller('chatController', ChatController);

})();
