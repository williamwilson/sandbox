var express = require('express'),
    app = express(),
    socketio = require('socket.io'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    store = new session.MemoryStore(),
    Users = require('./db/users.js'),
    passportSocketIo = require('passport.socketio'),
    cookieParser = require('cookie-parser'), 
    sessionSecret = 'never tell anyone this deathly surprise',
    geometry = require('./pb-shooter/geometry.js'),
    Map = geometry.Map,
    Nanotimer = require('Nanotimer');

app.use(express.static(__dirname + '/public/tmp'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({store: store, secret: sessionSecret, resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session({store: store, secret: sessionSecret}));

passport.serializeUser(Users.serialize);
passport.deserializeUser(Users.deserialize);
passport.use(require('./auth/local.js'));

process.env.PORT = 1337;
var server = require('http').createServer(app).listen(process.env.PORT, function() {
  console.log('App running at http://%s:%s', server.address().address, server.address().port);
});

var sio = socketio.listen(server);
sio.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'connect.sid',
  secret: sessionSecret,
  passport: passport,
  store: store,
  success: function(data, accept) { accept(); },
  fail: function(data, message, error, accept) { accept(); }
}));

var Game = require('./pb-shooter/game.js');
var game = new Game(new Map(1400, 500));
var gameTimer = new Nanotimer();
var gameState = game;
gameTimer.setInterval(function() {
  gameState = game.tick.call(game, gameState);
}, game, '16m');

app.get('/', function (req, res) {
  res.render('index.ejs', { sessionValue: req.session.sessionValue, results: [] });
});

app.get('/d3', function(req, res) {
  res.render('d3.ejs');
});

app.get('/pb-shooter', function(req, res) {
  res.render('pb-shooter.ejs');
});

app.post('/login', passport.authenticate('local'), function(req, res) {
  res.send('authenticated successfully');
});

var tickCount = 0;
var pushInterval = 3;
var sockets = [];
game.afterTick(function(gameState) {
  tickCount++;
  tickCount = tickCount % pushInterval;
  if (tickCount != 0)
    return;
    
  for(var i = 0; i < sockets.length; i++) {
    sockets[i].emit('tick', gameState);
  }
});

sio.on('connection', function(socket) {
  var user = socket.request.user;
  sockets.push(socket);
  
  socket.on('inputs', function(inputs) {
    game.setInputs(socket.id, inputs);
  });
});