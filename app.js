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
   res.render('index.ejs', { name: 'Shoopda' });
});

app.io.route('ready', function(req) {
  req.io.emit('message', 'i have sending u message'); 
});

util.bundle().then(function() { console.log('all done bundling'); });

var server = app.listen(process.env.PORT, function() {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port);
});