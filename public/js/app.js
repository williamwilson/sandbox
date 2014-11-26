(function() {
  window.App = function(data) {
    var self = this;
  
    self.io = window.io.connect();
    self.io.emit('ready');
    self.io.on('saved session value', function(data) {
      self.sessionValue(data); 
    });
      
    self.sessionValue = ko.observable(data.sessionValue);
    self.saveSessionValue = function(value) {
      self.io.emit('save session value', value);
    }
  }
})();