var express = require('express');
var path = require('path');
var http = require('http');
var _ = require('underscore');


var app = express();
// Static Express Server Settings
// app.use(express.static('./public'));
app.get('/', function (req, res) {
	// res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
	res.send({"hello" : "world"});
});
app.get('/json/:keyword', function (req, res) {
	var keyword = req.params.keyword;
	var params = { q: keyword, count: 1000, json: true };
	for (var param in req.query) {
		params[param] = req.query[param];
	}

	console.log('keyword - ', keyword);

	Promise.resolve(params)
		.then(function(params) {
			console.log('P1');
			return new Promise(function(resolve, reject) {
				oa.getOAuthAccessToken('', {'grant_type':'client_credentials'}, function (e, access_token, refresh_token, results){
				if (e) console.log('error: ', error);
				bearerToken = access_token;

				var oauthObj = {
					consumer_key: 		consumerKey,
					consumer_secret: 	consumerSecret,
					bearer_token: 		bearerToken
				};

				twiCli = new Twitter(oauthObj);

				// twitterGetSearchRouter(params);
				// twitterStreamSearchRouter(); // currently returning 401 Status : Unauthorized for some reason
				// twitterStreamStatusesFilterRouter();
				resolve(params);
			});
		});
	})
	.then(function(params) {
		console.log('P2');
		return new Promise(function(resolve, reject) {
			twiCli.get('search/tweets', params, function(err, tweets, res) {
				if (err) {
					reject(err);
				} else {
					resolve(tweets)
				}
			});
		});
	})
	.then(function(tweets) {
		console.log('P3');
		res.send(tweets);
	},
	function (err) {
		res.send(err);
	});

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


var consumerKey = process.env.CONSUMER_KEY || require('./twitterConfig').consumerKey, 
	consumerSecret = process.env.CONSUMER_SECRET || require('./twitterConfig').consumerSecret, 
	bearerToken = 'abc';

var oa = new Oath2(
	consumerKey,
	consumerSecret, 
	'https://api.twitter.com/', 
	null,
	'oauth2/token', 
	null
);

var tweetLog = [];



// todo - convert this to a Router() for Twitter API requests
function hitTwitter (params) {
	oa.getOAuthAccessToken('', {'grant_type':'client_credentials'}, function (e, access_token, refresh_token, results){
		if (e) console.log('error: ', error);
		bearerToken = access_token;

		var oauthObj = {
			consumer_key: 		consumerKey,
			consumer_secret: 	consumerSecret,
			bearer_token: 		bearerToken
		};

		twiCli = new Twitter(oauthObj);

		twitterGetSearchRouter(params);
		// twitterStreamSearchRouter(); // currently returning 401 Status : Unauthorized for some reason
		// twitterStreamStatusesFilterRouter();
	});
}

hitTwitter();

// REST GET Methods
function twitterGetSearchRouter (params) {
	if (typeof params === 'undefined') params = { q: 'resist', count: '1000'};

	if (params.json) {

	} else {
		twiCli.get('search/tweets', params, twitterGetSearchHandler);
	}
	
}
function twitterGetSearchHandler (err, tweets, res) {
	if (err) return console.log('GET error: ', err, bearerToken);
	// tweetLog = _.union(tweetLog, tweets.statuses);
	tweetLog = tweets.statuses;

	console.log("TWEETS UPDATED - length: ", tweetLog.length);
}

// STREAMING GET Methods
// function twitterStreamSearchRouter (params) {
// 	if (typeof params === 'undefined') params = { track: 'resist'};
// 	twiCli.stream('statuses/firehose', params, twitterStreamSearchHandler);
	
// }
// function twitterStreamSearchHandler (stream) {
// 	stream.on('data', function (event) {
// 		console.log('event: ', event && event.text);
// 	});
// 	stream.on('error', function (err) { console.log("stream error: ",err, bearerToken); });
// }

// STREAMING POST statuses/filter
// function twitterStreamStatusesFilterRouter (params) {
// 	if (!params || typeof params === 'undefined') params = { track: 'resist'};

// 	twiCli.stream('statuses/filter', params, twitterStreamStatusesFilterHandler);
// }
// function twitterStreamStatusesFilterHandler (stream) {
// 	stream.on('data', function (event) {
// 		console.log('event: ', event && event.text);
// 	});

// 	stream.on('error', function (err) { console.log("stream error: ",err, bearerToken); });
// }




// Init IO
var io = require('socket.io').listen(server);
var connections = [];

// Listen for connection before assigning listeners
io.sockets.on('connection', function (socket) {

	// hitTwitter();

	// Listen for disconnection from either Oz or Dorthy
	socket.once('disconnect', function() {
		connections.splice(connections.indexOf(socket), 1);
		// console.log('Client Disconnect - ' + connections.length + ' connections remaining');
		socket.disconnect();
	});


	socket.on('fetch-tweets', function () {
		socket.emit('send-tweets', tweetLog);
	});

	connections.push(socket);
});