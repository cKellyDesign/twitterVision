var express = require('express');
var path = require('path');
var http = require('http');
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



// Initialize authorization for Tiwtter API
var OAuth = require('oauth'),
	Oath2 = OAuth.OAuth2;
var Twitter = require('twitter')
	twiCli = null;


var consumerKey = require('./twitterConfig').consumerKey, 
	consumerSecret = require('./twitterConfig').consumerSecret, 
	bearerToken = require('./twitterConfig').bearerToken;

var oa = new Oath2(
	consumerKey,
	consumerSecret, 
	'https://api.twitter.com/', 
	null,
	'oauth2/token', 
	null
);

// REST GET Methods
function twitterGetSearchRouter (params) {
	if (typeof params === 'undefined') params = { q: 'resist', count: 2 };

	twiCli.get('search/tweets', params, twitterGetSearchHandler);
}
function twitterGetSearchHandler (err, tweets, res) {
	if (err) return console.log('GET error: ', err, bearerToken);
	console.log('\n\nTWEETS', tweets);
}

// STREAMING GET Methods
function twitterStreamSearchRouter (params) {
	if (typeof params === 'undefined') params = { track: 'resist'};

	twiCli.stream('statuses/firehose', params, twitterStreamSearchHandler);
	
}
function twitterStreamSearchHandler (stream) {
	
	stream.on('data', function (event) {
		console.log('event: ', event && event.text);
	});

	stream.on('error', function (err) { console.log("stream error: ",err, bearerToken); });
}


oa.getOAuthAccessToken('', {'grant_type':'client_credentials'}, function (e, access_token, refresh_token, results){
	if (e) console.log('error: ', error);
	bearerToken = access_token;

	twiCli = new Twitter({
		consumer_key: 		consumerKey,
		consumer_secret: 	consumerSecret,
		bearer_token: 		bearerToken
	});

	twitterGetSearchRouter();
	// twitterStreamSearchRouter(); // currently returning 401 Status : Unauthorized for some reason
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