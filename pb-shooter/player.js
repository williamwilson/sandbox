var 
  geometry = require('./geometry.js'),
  Vector = geometry.Vector,
  augment = require('augment'),
  Unit = require('./unit.js'),
  SAT = require('sat'),
  d3 = require('d3');

var Player = augment(Unit, function(base) {
  this.constructor = function(position, vector) {
    vector = vector || Vector.fromPoints(position, position);

    base.constructor.call(this, position, vector);
    base.rectangle.call(this, 25, 25);
    this.speed = 6;
  };
  this.hitBox = function() {
    return base.rectangleHitBox.call(this);
  };
  this.move = function(target) {
    var v = Vector.fromPoints(this.position, target);
    if (v.distance < 5)
      return;
      
    var speed = d3.min([this.speed, v.distance / 10]);
    
    this.angle = v.angle;
    this.heading = v.heading;
    base.move.call(this, speed);
  }
});

module.exports = Player;