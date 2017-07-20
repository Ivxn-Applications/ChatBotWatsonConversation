(function () {

  angular.module('askMobile', ['ngSanitize', 'ngCookies'])

  .config(function($locationProvider) {
    $locationProvider.html5Mode(true);
  })

  .run(function () {
    var socket = io({ reconnection: false });

    socket.on('connect', function () {
      socket.emit('chat-status', { message: 'open', from: 'chat'});
      socket.emit('disconnect');
    });
  });

}());

(function () {

  function ChatController ($scope, $timeout, WatsonConversation, Feedback, ChatMessage, Utils , FeedbackNegative) {
    $scope.messages = [];
    $scope.bootstraped = false;
    $scope.block = { input: false, feedback: false };
    var feedbacking = false;
    var user = null;
    var previousFeedback='';
    $scope.feedback = function (message, type) {
      if (feedbacking || message.feedback === type) {
        return;
      }

      feedbacking = true;
      message.feedback = type;

      Feedback.save({id: message.data["_id"], feedback: message.feedback })
      .success(function (result) {

        message.feedback = type;
        message.data._id = result.id;
        message.data._rev = result.rev;
        feedbacking = false;
        $scope.block.input = false;
        $scope.focus = true;
        $scope.block.feedback = false;
        if(message.feedback=='negative'){
          $scope.messages.push(ChatMessage.feedbackNegative({dataDoc:message.data,feedbackNegative:"none"}));
          Utils.scrollDown('message-' + ($scope.messages.length - 1));
          previousFeedback='negative';
        }
        else{
          if(previousFeedback==='negative'&& message.feedback === 'positive')
            $scope.messages.pop();
        }
      })
      .error(console.error);
    }
    $scope.feedbackNegative = function(message,type){
      if(type===''){
        return;
      }
      FeedbackNegative.save({id:message.data._id,feedbackNegative:type}).success(function (){
        console.log('index ',($scope.messages.length - 1));
        switch (type) {
          case "This answer does not help me to find what I am looking for.":document.getElementById("buttonOpc1-"+($scope.messages.length - 1)).setAttribute("class",'negative feedback-btn red-border');document.getElementById("buttonOpc2-"+($scope.messages.length - 1)).setAttribute("class",'feedback-btn red-border');document.getElementById("inputNegative-"+($scope.messages.length - 1)).setAttribute("class",'feedback-btn red-border');  break;
          case "Though my question is answered, I am not satisfied with that answer.":document.getElementById("buttonOpc2-"+($scope.messages.length - 1)).setAttribute("class",'negative feedback-btn red-border');document.getElementById("buttonOpc1-"+($scope.messages.length - 1)).setAttribute("class",'feedback-btn red-border');document.getElementById("inputNegative-"+($scope.messages.length - 1)).setAttribute("class",'feedback-btn red-border'); break;
          default: document.getElementById("inputNegative-"+($scope.messages.length - 1)).setAttribute("class",'red-border negative feedback-btn');document.getElementById("buttonOpc1-"+($scope.messages.length - 1)).setAttribute("class",'red-border feedback-btn'); document.getElementById("buttonOpc2-"+($scope.messages.length - 1)).setAttribute("class",'feedback-btn red-border');break;
        }
        console.log("Negative Feedback was sent");
      })
    }
    $scope.getNegativeInput = function(message){
      console.log("inputNegative-"+($scope.messages.length - 1));
      message.negativeFeedback=document.getElementById("inputNegative-"+($scope.messages.length - 1)).value;
      $scope.feedbackNegative(message,message.negativeFeedback);
      ChatMessage.feedbackNegative(message.negativeFeedback);
    }
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
              $scope.block.feedback = false;//must to be true
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

  ChatController.$inject = ['$scope', '$timeout', 'WatsonConversation', 'Feedback', 'ChatMessage', 'Utils', 'FeedbackNegative'];
  angular.module('askMobile').controller('chatController', ChatController);

})();

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

(function () {

  function ChatMessage () {
    var self = this;

    var watsonPhoto = 'img/watson_logo.svg';

    self.user = function (input, id) {
      return {
        from: 'user',
        image: 'http://faces.tap.ibm.com:10000/image/' + id,
        text: input,
        feedback: null,
      }
    };

    self.watson = function (response) {
      return {
        from: 'watson',
        image: watsonPhoto,
        text: response.text,
        feedback: response.feedback,
        data: response.data
      };
    };

    self.lowConfidence = function (response) {
      return {
        from: 'watson',
        image: watsonPhoto,
        text: response.text,
        feedback: null,
        data: null
      };
    };

    self.feedback = function (response) {
      return {
        from: 'feedback',
        image: watsonPhoto,
        text: 'How useful was the answer I provided you?',
        feedback: 'no feedback',
        data: response.data
      };
    };
    self.feedbackNegative = function (response) {
      console.log("ChatMessage feedbackNegative ",response);
      return {
        from: 'feedbackNegative',
        image: watsonPhoto,
        text: "Why isn't this answer useful?",
        feedback: 'negative',
        negativeFeedback:response.feedbackNegative,
        data: response.dataDoc
      };
    };

    return self;
  }

  ChatMessage.$inject = [];
  angular.module('askMobile').service('ChatMessage', ChatMessage);
})();

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
