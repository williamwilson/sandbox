var 
  SAT = require('SAT'),
  Unit = require('.\\unit.js');

var Player = augment(Unit, function(base) {
  this.constructor = function(position, vector) {
    base.constructor.call(this, position, vector);
    base.rectangle.call(this, 25, 25);
    this.speed = 6;
  };
  this.hitBox = function() {
    return base.rectangleHitBox.call(this);
  };
  this.move = function(target) {
    var v = new Vector(this.position, target);
    if (v.distance < 5)
      return;
      
    var speed = d3.min([this.speed, v.distance / 10]);
    
    this.angle = v.angle;
    this.heading = v.heading;
    base.move.call(this, speed);
  }
});

var Explosion = augment(Unit, function(base) {
  this.constructor = function(position, vector) {
    base.constructor.call(this, position, vector);
    this.drawOffset = { x: 12.5, y: 12.5 };
    this.rotateOffset = { x: 12.5, y: 12.5 };
    this.lifespan = 40;
  }
  this.move = function() { 
    this.lifespan--;
  }
});

var Laser = augment(Unit, function(base) {
  this.constructor = function(position, vector) {
    base.constructor.call(this, position, vector);
    base.rectangle.call(this, 12, 2);
    this.speed = 10;
  };
  this.hitBox = function() {
    return base.rectangleHitBox.call(this);
  }
});