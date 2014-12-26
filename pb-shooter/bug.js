var 
  augment = require('augment'),
  Unit = require('./unit.js'),
  SAT = require('sat');

var Bug = augment(Unit, function (base) {
  this.constructor = function(position, vector) {
    base.constructor.call(this, position, vector);
    this.vector = vector;
    this.speed = 2;
    this.drawOffset = { x: 12.5, y: 12.5 };
  };
  this.hitBox = function() {
    return new SAT.Circle(new SAT.Vector(this.position.x+1, this.position.y+1.5), 8);
  };
});

module.exports = Bug;