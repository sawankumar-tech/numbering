var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv);

// Serve static files
app.use('/client', express.static(__dirname + '/client'));

// Serve index.html on root route
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

// Object to store connected sockets
var SOCKET_LIST = {};

// Handle socket connection
io.on('connection', function (socket) {
  console.log('Socket connected, Socket ID:', socket.id);

  // Assign random properties to the socket
  socket.id = Math.random();
  socket.x = 0;
  socket.y = 0;
  socket.number = '' + Math.floor(10 * Math.random());
  SOCKET_LIST[socket.id] = socket;

  // Handle disconnection
  socket.on('disconnect', function () {
    console.log('Socket disconnected, Socket ID:', socket.id);
    delete SOCKET_LIST[socket.id];
  });
});

// Update socket positions and emit data
setInterval(function () {
  var pack = [];
  for (var i in SOCKET_LIST) {
    var socket = SOCKET_LIST[i];
    socket.x++;
    socket.y++;
    pack.push({
      x: socket.x,
      y: socket.y,
      number: socket.number
    });
  }

  // Emit the updated positions to all clients
  for (var i in SOCKET_LIST) {
    var socket = SOCKET_LIST[i];
    socket.emit('newPositions', pack);
  }
}, 1000 / 25);

// Start server
serv.listen(2000, function () {
  console.log('Server started on http://localhost:2000');
});
