var express = require('express'),
    app = express(),
    util = require('./util/util.js');

app.use(express.static(__dirname + '/public/tmp'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
   res.render('index.ejs', { name: 'Shoopda' });
});

util.bundle().then(function() { console.log('all done bundling'); });

var server = app.listen(process.env.PORT, function() {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port);
});