var express = require("express");
var app = express();
var port = process.env.PORT || 3702;
var io = require('socket.io').listen(app.listen(port));
var Instagram = require('instagram-node-lib');
var http = require('http');
var request = ('request');
var intervalID;
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {


  /*this.wait(12000, function() {

    // stop() terminates the interval
    // off() shuts the led off
    led.stop().off();
  });
*/


  var led = new five.Led(11);
  /*setTimeout(function() {
    blinka();
  }, 5000);
*/
/*
  function blinka() {
  var durata = 2680;
    setTimeout(function() { led.stop().off(); }, durata);

    led.pulse({
      easing: "linear",
      duration: durata,
      //  cuePoints: [0, 0.075, 0.141, 0.25, 1, 0],
      //  keyFrames: [0, 255, 0, 255, 0, 0],

      cuePoints: [0, 0.1, 0.2, 0.3, 1],
      keyFrames: [0, 255, 0, 255, 0],

      oncomplete: function() {
        console.log("Animation stopped");
      }
    });
  };
*/
function blinka() {
var durata = 2000;
  setTimeout(function() { led.stop().off(); }, durata);

  led.pulse({
    easing: "linear",
    duration: durata,
    //  cuePoints: [0, 0.075, 0.141, 0.25, 1, 0],
    //  keyFrames: [0, 255, 0, 255, 0, 0],

    cuePoints: [0, 0.15, 0.25, 0.4, 1],
    keyFrames: [0, 255, 0, 255, 0],

    oncomplete: function() {
      console.log("Animation stopped");
    }
  });
};


  /**
   * Set the paths for your files
   * @type {[string]}
   */
  var pub = __dirname + '/public',
    view = __dirname + '/views';

  /**
   * Set the 'client ID' and the 'client secret' to use on Instagram
   * @type {String}
   */
  var clientID = '9a0a6df896cc436daba9de70428ca4a7',
    clientSecret = '38370a635b2742129b472804543f3375';

  /**
   * Set the configuration
   */
  /**
   * METTERE SEMPRE LA PORTA DOPO GLI URL AD ES WWW.GOOGLE.IT:3702
   * */

  Instagram.set('client_id', clientID);
  Instagram.set('client_secret', clientSecret);
  Instagram.set('callback_url', 'https://8255374e.ngrok.io/callback');
  Instagram.set('redirect_uri', 'https://8255374e.ngrok.io');
  Instagram.set('maxSockets', 10);

  /**
   * Uses the library "instagram-node-lib" to Subscribe to the Instagram API Real Time
   * with the tag "hashtag" lollapalooza
   * @type {String}
   */
  Instagram.subscriptions.subscribe({
    object: 'tag',
    object_id: 'cuoredinapoli',
    aspect: 'media',
    callback_url: 'https://8255374e.ngrok.io/callback',
    type: 'subscription',
    id: '#'
  });



  // if you want to unsubscribe to any hashtag you subscribe
  // just need to pass the ID Instagram send as response to you
  //Instagram.subscriptions.unsubscribe({ id: '21487306' });


  // https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
  io.configure(function() {
    io.set("transports", [
      'websocket', 'xhr-polling', 'flashsocket', 'htmlfile', 'jsonp-polling'
    ]);
    io.set("polling duration", 10);
  });

  /**
   * Set your app main configuration
   */
  app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(pub));
    app.use(express.static(view));
    app.use(express.errorHandler());
  });

  /**
   * Render your index/view "my choice was not use jade"
   */
  app.get("/views", function(req, res) {
    res.render("index");
  });

  // check subscriptions
  // https://api.instagram.com/v1/subscriptions?client_secret=INSERIRE IL CLIENT SECRET&client_id=QUI IL CLIENT ID

  /**
   * On socket.io connection we get the most recent posts
   * and send to the client side via socket.emit
   */
  io.sockets.on('connection', function(socket) {
    Instagram.tags.recent({
      name: 'cuoredinapoli',
      complete: function(data) {
        socket.emit('firstShow', {
          firstShow: data
        });
      }
    });
  });

  /**
   * Needed to receive the handshake
   */
  app.get('/callback', function(req, res) {
    var handshake = Instagram.subscriptions.handshake(req, res);
  });

  /**
   * for each new post Instagram send us the data
   */
  app.post('/callback', function(req, res) {
    var data = req.body;

    // Grab the hashtag "tag.object_id"
    // concatenate to the url and send as a argument to the client side
    data.forEach(function(tag) {
      var url = 'https://api.instagram.com/v1/tags/' + tag.object_id + '/media/recent?client_id=' + clientID;
      sendMessage(url);
      //  sendMessage("ok");
      blinka();




    });
    res.end();
  });

  /**
   * Send the url with the hashtag to the client side
   * to do the ajax call based on the url
   * @param  {[string]} url [the url as string with the hashtag]
   */
  function sendMessage(url) {
    io.sockets.emit('show', {
      show: url
    });
  }




  console.log("Listening on port " + port);
});
