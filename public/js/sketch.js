// Instantiate global p5
new p5(); 

var Display = function (p) {

	p.setup = function () {
		var Canvas = createCanvas(windowWidth, windowHeight); 
		Canvas.parent('container');
	};

	p.draw = function () {
		clear();
		rect(100, 100, 100, 100);
	};

	// Socket.io Init, Listners, Emitters
	p.socket = io();

	p.socket.on('connect', function(){

	});
};

window.canvasDisplay = new p5(Display);