var express = require('express');
    app = express(),
    fs = require('fs-extra');

app.use(express.static(__dirname + '/public/tmp/js'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
   res.render('index.ejs', { name: 'Shoopda' });
});

fs.remove(__dirname + '/public/tmp/', function() {
  fs.copy(__dirname + '/public/js/app.js', __dirname + '/public/tmp/js/app.js', function() {    
    fs.copy(__dirname + '/public/js/vendor', __dirname + '/public/tmp/js/vendor', function() {    
      console.log('done');
    });
  });
});

var server = app.listen(process.env.PORT, function() {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port);
});