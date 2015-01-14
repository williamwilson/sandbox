var augment = require('augment');

var Map = augment(Object, function() {
  this.constructor = function(width, height) {    
    this.width = width;
    this.height = height;
  };
  this.getRandomPoint = function() {
    var x = Math.floor(Math.random() * this.width);
    var y = Math.floor(Math.random() * this.height);
    return { x: x, y: y };
  };
  this.center = function() {
    return { x: this.width/2, y: this.height/2 };
  };
  this.pointOffMap = function(point) {    
    if (point.x < -10 || point.x > this.width + 10)
      return true;
    if (point.y < -10 || point.y > this.height + 10)
      return true;
  };
});

var Vector = {
  fromPoints: function(pointA, pointB) {
    var vector = {
      pointA: pointA,
      pointB: pointB,
    };

    if (pointA.x == pointB.x && pointA.y == pointB.y) {
      dx = 0;
      dy = 0;
      vector.distance = 0;
      vector.angle = 0;
      vector.heading = {x: 0.5, y: 0.5};
      return vector;
    }

    var dx = pointA.x - pointB.x;
    var dy = pointA.y - pointB.y;
    vector.distance = Math.sqrt((dx*dx) + (dy*dy));
    vector.angle = Math.asin(dy / vector.distance) * 180 / Math.PI;
    if (dx < 0)
      vector.angle = -vector.angle
    vector.heading = {x: dx / vector.distance, y: dy / vector.distance};

    return vector;
  }
}

module.exports = {
  Vector: Vector,
  Map: Map
};