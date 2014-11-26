var express = require('express.io'),
    app = express(),
    util = require('./util/util.js');
app.http().io();

app.use(express.static(__dirname + '/public/tmp'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.cookieParser());
app.use(express.session({secret: 'never tell aynone this deathly surprise'}));

app.get('/', function (req, res) {
   res.render('index.ejs', { sessionValue: req.session.sessionValue });
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