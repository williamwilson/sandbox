var express = require('express.io'),
    app = express(),
    util = require('./util/util.js'),
    passport = require('passport'),
    Promise = require('bluebird'),
    bodyParser = require('body-parser');
    LocalStrategy = require('passport-local').Strategy;
app.http().io();

app.use(express.static(__dirname + '/public/tmp'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.session({secret: 'never tell aynone this deathly surprise'}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  console.log('tryna serialize user');
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('tryna deserialize user');
  FindUser(id).then(function (user) {
    console.log('done findin user');
    console.log(user);
    done(null, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log('tryna authenticate');
    FindUser(username).then(function(user) {
      if (!user)
        return done(null, false, { message: 'Incorrect username.' });
      
      if (!user.validPassword(password))
        return done(null, false, { message: 'Incorrect password.' });
        
      return done(null, user);
    });
  })
)

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : '127.0.0.1',
    user     : 'joelhoward0',
    database : 'sandbox'
  }
});

function FindUser(username) {
  console.log('tryna find user');
  return Promise.resolve({
    id: 1,
    username: 'Steven Jevenson',
    validPassword: function(password) { return password == "password"; }
  });
}

app.get('/', function (req, res) {
  knex.select('*').from('test').then(function(result) {
    res.render('index.ejs', { sessionValue: req.session.sessionValue, results: result });
  });
});

app.post('/login', passport.authenticate('local'), function(req, res) {
  console.log('authenticated successfully');
  res.send('authetnicated successfully');
});

app.get('/shoops', function(req, res) {
  console.log(req.isAuthenticated());
  res.send('isAuthenticated: ' + req.isAuthenticated());
});

app.io.route('ready', function(req) {
  console.log('socket connected');
});

app.io.route('save session value', function(req) {
  console.log('saving session value:' + req.data);
  req.session.sessionValue = req.data;
  req.session.save(function() {
    console.log('saved session');
    req.io.emit('saved session value', req.data);
  });
});

util.bundle().then(function() { console.log('all done bundling'); });

var server = app.listen(process.env.PORT, function() {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port);
});