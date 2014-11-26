$(function() {
  window.app = {};
  var app = window.app;
  
  app.io = window.io.connect();
  app.io.emit('ready');
  app.io.on('message', function(data) {
    alert('message: ' + data);
  });
});