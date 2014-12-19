(function() {
  var Point = window.Point;
  
  window.Inputs = augment(Object, function() {
    this.constructor = function(inputs) {
      if (typeof inputs != "object")
        throw new Error("inputs was not an object, it was: " + inputs);
      if (typeof inputs.mouse != "function")
        throw new Error("inputs.mouse was not a function, it was: " + inputs.mouse);
      if (typeof inputs.click != "function")
        throw new Error("inputs.click was not a function, it was: " + inputs.click);
      if (typeof inputs.spacebar != "function")
        throw new Error("inputs.spacebar was not a function, it was: " + inputs.spacebar);
        
      this.mouse = function() { return inputs.mouse() };
      this.click = function() { return inputs.click() };
      this.spacebar = function() { return inputs.spacebar(); };
    };
  });
  
  
  window.ClientInputs = augment(Object, function() {
    this.constructor = function() {
      var self = this;
      this.mousePosition = { x: 0, y: 0 };
      this.mouseDown = false;
      this.spacebarDown = false;
      
      $(window).on('mousemove', function(e) {
        self.mousePosition = { x: e.pageX, y: e.pageY };
      });
      $(window).on('mousedown', function(e) { self.mouseDown = true; });
      $(window).on('mouseup', function(e) { self.mouseDown = false; });
      $(window).on('keydown', function(e) {
        if (e.keyCode == 32)
          $(window).trigger('space', e);
      });
      $(window).on('keyup', function(e) {
        if (e.keyCode == 32)
          $(window).trigger('spaceup', e);
      });
      $(window).on('space', function() { self.spacebarDown = true; });
      $(window).on('spaceup', function() { self.spacebarDown = false; });
    };
    this.mouse = function() {
      return new Point(this.mousePosition.x, this.mousePosition.y);
    }
    this.click = function() {
      return this.mouseDown;
    }
    this.spacebar = function() {
      return this.spacebarDown;
    }
  });
})();