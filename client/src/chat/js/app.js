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
