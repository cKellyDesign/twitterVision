var express = require('express');
var path = require('path');
var _ = require('underscore');
var app = express();

// Static Express Server Settings
app.use(express.static('./public'));
app.get('*', function (req, res) {
	res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// start up the server on port 3000
var server = app.listen(process.env.PORT || 3000, function() {
	console.log('Express Server running on port %s', this.address().port);
});


// Init IO
var io = require('socket.io').listen(server);
var connections = [];

// Listen for connection before assigning listeners
io.sockets.on('connection', function (socket) {

	// Listen for disconnection from either Oz or Dorthy
	socket.once('disconnect', function() {
		connections.splice(connections.indexOf(socket), 1);
		// console.log('Client Disconnect - ' + connections.length + ' connections remaining');
		socket.disconnect();
	});


	connections.push(socket);
});