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
      return {
        from: 'feedbackNegative',
        image: watsonPhoto,
        text: "Why isn't this answer useful?",
        feedback: 'negative',
        negativeFeedback:'no feedback neagtive',
        data: response.id
      };
    };

    return self;
  }

  ChatMessage.$inject = [];
  angular.module('askMobile').service('ChatMessage', ChatMessage);
})();
