(function () {
  function fadeIn(el) {
    el.style.opacity = 0;


    var tick = function() {
      el.style.opacity = +el.style.opacity + 0.01;


      if (+el.style.opacity < 1) {
        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
      }
    };

    tick();
  }

  function openChat () {
    var xhr = new XMLHttpRequest();

    function response () {
      var res = JSON.parse(xhr.responseText);
      var device = res.device;

      if (device === "desktop") {
        var newW = window.open("/chat", "chat", "menubar=1,resizable=0,width=720,height=800");
        var community = res.community;

        if (newW) {
          newW.focus();
          window.location.assign(community);
        } else {
          var body = document.querySelector('body'),
              h2 = document.querySelector('h2');

          h2.innerHTML = "Hello, " + res.user.name.split(' ')[0] + "!";
          // body.className = body.className + " fadein";
          body.style.backgroundColor = '#337ab7';
          fadeIn(body);

          var socket = io({ reconnection: false });

          socket.on('chat-status', function (status) {
            if (status.message === "open") {
              window.location.assign(community);
            }
          });
        }
      } else if (device === "mobile") {
        window.location.assign("/chat");
      }
    }

    xhr.open("get", "/api/info");
    xhr.onload = response;
    xhr.send();
  }

  window.onload = openChat;
}());
