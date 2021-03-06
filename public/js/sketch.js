// Instantiate global p5
new p5();

var DisplayView = function (p) {

	p.tweets = [];
	p.tweetDetails = null;
	p.doDetectCollision = true;

	p.preload = function () {
		window.displayControl = new DisplayControl(p);
	};

	p.setup = function () {
		var Canvas = createCanvas(windowWidth, windowHeight); 
		Canvas.parent('container');

		// p.tweetDisplay = new TweetDisplay(p);
		// noStroke();

	};

	p.draw = function () {
		clear();
		
		p.renderFlakes();
	};

	p.mouseClicked = function() {
		removeElements();
		p.doDetectCollision = true;
	};


	// Helper Functions

	p.renderFlakes = function () {
		// for each snowflake
		for (var i = 0; i < p.tweets.length; i++) {
			var flake = p.tweets[i]; // define current snowflake

			if (!flake.c) flake.c = color('rgba(255, 255, 255, ' + random(0,1) + ')'); 
			fill(flake.c);
			
			

			if (p.doDetectCollision && p.detectCollision(flake)) {
				p.doDetectCollision = false;
				flake.hasBeenViewed = true;
				p.generateTweetDetails(flake);
			}

			// update flake y coordienate based on flake velocity
			flake.y = flake.y + flake.v;

			// if flake is beyond bottom of the canvas element, start it at the top
			if ( flake.y > windowWidth ) {
				flake.y = 0;
				flake.x = random(windowWidth);
			}

			if ( flake.hasBeenViewed ) {
				stroke(color('rgba(255,255,255,1)'));
			} else if (flake.tweetIMG) {
				stroke(color('red'));
			} else {
				stroke(color('rgba(255,255,255,0)'));
			}

			var osX = p.determineOsillation(flake);

			// draw snowflake
			ellipse(flake.x + osX, flake.y, flake.size, flake.size);
			if (!!p.tweetDetails) p.renderFlakeDetails();
		}
	};

	p.generateTweetDetails = function (flake) {
		p.tweetDetails = {
			anchorX : (flake.x - 250 < 0) ? 0 : (flake.x + 250 > windowWidth) ? windowWidth - 500 : flake.x - 250,
			anchorY : (flake.y - 125 < 0) ? 0 : (flake.y + 125 > windowHeight) ? windowHeight - 250 : flake.y - 125,
			tweet   : flake
		};

	};
	p.renderFlakeDetails = function () {
		removeElements();

		// console.log(p.tweetDetails.tweet);

		var tweetHtml = '<p class="tweetText">' + 
							'<a target="_blank" href="' + p.tweetDetails.tweet.tweetURL + '">' + p.tweetDetails.tweet.text + '</a></p>';

		p.tweetDetailDiv = createDiv(tweetHtml);
		p.tweetDetailDiv
			.position(p.tweetDetails.anchorX, p.tweetDetails.anchorY)
			.class('tweetDiv')
			// .style('color', color('red'))
			// .style('width', (windowWidth / 2))
			// .style('border', '1px solid #aaa')
		;

		if (p.tweetDetails.tweet.tweetIMG) 

			$('.tweetDiv').prepend(
				'<a class="tweetImgContainer" href="' + p.tweetDetails.tweet.tweetIMGlink + '" target="_blank">' +
					'<img src="' + p.tweetDetails.tweet.tweetIMG + '">' +
				'</a>'
			);



		p.tweetDetails = null;
	};

	p.detectCollision = function (flake) {
		if (mouseX < (flake.x + (flake.size / 2) + 10) && mouseX > (flake.x - (flake.size / 2) - 10 ) &&
			mouseY < (flake.y + (flake.size / 2) + 10) && mouseY > (flake.y - (flake.size / 2) - 10 ) ) {
			return true;
		}

		return false;
	}

	p.determineOsillation = function (flake) {
		if (flake.o.dir === "right") {
			if (flake.o.curr > flake.o.range) {
				flake.o.dir = "left";
			} else {
				flake.o.curr++;
			}
		} else {
			if (flake.o.curr < (flake.o.range * -1)) {
				flake.o.dir = "right";
			} else {
				flake.o.curr--;
			}
		}
		// return flake.o.curr;
		var coeff = .05;
		return random(10,15) * Math.sin(flake.o.curr * random(.02, .05));
	};

	p.generateTweets = function (payload) {
		var tweet = {};
		console.log(payload);
		for (var i=0; i<payload.length; i++) {
			tweet = payload[i];

			// if (tweet.entities && tweet.entities.media) console.log(i, tweet.entities.media);

			var d1 = new Date(tweet.created_at);
			var d2 = new Date();
			var d1MS = d1.getTime();
			var d2MS = d2.getTime();

			var ddMS	= d2MS - d1MS;
			var ddS 	= ddMS / 1000;
			var ddM 	= ddS / 60;
			var ddH		= ddM / 60;

			// console.log(ddH);


			var curr = {
				text : tweet.text,
				retweet_count : tweet.retweeted_status && tweet.retweeted_status.retweet_count,
				user_screenname : tweet.user && tweet.user.screen_name,
				tweetURL : ('https://twitter.com/' +  (tweet.user && tweet.user.screen_name) +'/status/' + tweet.id_str),
				tweetIMG : tweet.entities.media && tweet.entities.media[0] && tweet.entities.media[0].media_url || null,
				tweetIMGlink : tweet.entities.media && tweet.entities.media[0] && tweet.entities.media[0].expanded_url,


				// tweetAge : ( ( new Date().getTime() ) - ( new Date( tweet.created_at ).getTime() ) / 1000 / 60 / 60 ),

				tweet: tweet,

				x : random(windowWidth), // where to start on x
				y : random((windowHeight * -1)), // where to start on y
				size : p.determineSize(tweet), // how big to be
				v : random(2, 5), // how fast to move
				c : color('rgba(26,131,232, ' + random(0.2,1) + ')'),
				o : { range: random(1, 5), dir: ((random(100) < 50) ? "left" : "right"), curr: 0 },
				hasBeenViewed : false
			};
			// console.log(curr.tweetAge);

			p.tweets.push(curr);
		}
	}

	p.determineSize = function (flake) {
		return (flake.retweet_count / 100);
	};

};

var DisplayControl = function (p) {
	var self = this;




	// Socket.io Init, Listners, Emitters
	this.socket = io();
	this.socket.on('connect', function () {
		self.socket.emit('fetch-tweets');
	});	

	this.socket.on('send-tweets', p.generateTweets);


};



window.canvasDisplay = new p5(DisplayView);