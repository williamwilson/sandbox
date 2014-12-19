(function() { 
  window.Point = augment(Object, function() {
    this.constructor = function(x, y) {
      if (typeof x != "number")
        throw new Error("x was not a number, it was: " + x);
      if (typeof y != "number")
        throw new Error("y was not a number, it was: " + y);
        
      this.x = x;
      this.y = y;
    }
  });
  
  window.Map = augment(Object, function() {
    this.constructor = function(width, height) {
      if (typeof width != "number")
        throw new Error("width was not a number, it was: " + width);
      if (typeof height != "number")
        throw new Error("height was not a number, it was: " + height);
      
      this.width = width;
      this.height = height;
    };
    this.getRandomPoint = function() {
      var x = Math.floor(Math.random() * this.width);
      var y = Math.floor(Math.random() * this.height);
      return new Point(x, y);
    };
    this.center = function() {
      return new Point(this.width/2, this.height/2);
    };
  });
  
  window.Vector = augment(Object, function () {
    this.constructor = function(pointA, pointB) {
      if (typeof pointA != "object" || !(pointA instanceof Point))
        throw new Error("pointA was not a number, it was: " + pointA);
      if (typeof pointB != "object" || !(pointB instanceof Point))
        throw new Error("pointB was not a number, it was: " + pointB);
      
      this.pointA = pointA;
      this.pointB = pointB;
      var dx = pointA.x - pointB.x;
      var dy = pointA.y - pointB.y;
      this.distance = Math.sqrt((dx*dx) + (dy*dy));
      this.angle = Math.asin(dy / this.distance) * 180 / Math.PI;
      if (dx < 0)
        this.angle = -this.angle
      this.heading = {x: dx / this.distance, y: dy / this.distance};
    };
  });
})();