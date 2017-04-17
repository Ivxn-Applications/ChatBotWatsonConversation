var chatEvent = {
  status: 'chat-status'
};

function chatStatus (room, socket) {
  return function listener (status) {
    socket.broadcast.to(room).emit(chatEvent.status, status);
  };
}

module.exports = function (io) {
  io.on('connection', attachListeners);

  function attachListeners (socket) {
    var room = socket.request.connection.remoteAddress;
    socket.join(room);

    socket.on(chatEvent.status, chatStatus(room, socket));
    // @TODO [might not be needed]
  }
};
