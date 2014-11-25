var express = require('express');
var app = express();

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
   res.render('index.ejs', { name: 'Shoopda' });
});

var server = app.listen(process.env.PORT, function() {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port);
});