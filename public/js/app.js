(function() {
  window.App = function(data) {
    var self = this;
  
    self.io = window.io.connect('https://sandbox-joelhoward0.c9.io');
    self.io.emit('ready');
    self.io.on('saved session value', function(data) {
      self.sessionValue(data); 
    });
      
    self.sessionValue = ko.observable(data.sessionValue);
    self.saveSessionValue = function(value) {
      self.io.emit('save session value', value);
    }
    
    self.reconnect = function() {
      self.io.disconnect();
      window.setTimeout(function() { self.io.connect(); }, 1);
    }
    self.check = function() {
      self.io.emit('check');
      $.ajax('check', function() {
        console.log('done');
      });
    }
    
    $('form').ajaxForm(function(result) {
      self.reconnect();
    });
    
    self.graph = new myGraph("#graph");
    self.graph.addNode("Cause");
    
  // // You can do this from the console as much as you like...
  // graph.addNode("Cause");
  // graph.addNode("Effect");
  // graph.addLink("Cause", "Effect");
  // graph.addNode("A");
  // graph.addNode("B");
  // graph.addLink("A", "B");
  }
})();