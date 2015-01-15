var 
  augment = require('augment'),
  Unit = require('./unit.js'),
  Vector = require('./geometry.js').Vector;

var Explosion = augment(Unit, function(base) {
  this.constructor = function(position, vector) {
    vector = vector || Vector.fromPoints(position, position);

    base.constructor.call(this, position, vector);
    this.drawOffset = { x: 12.5, y: 12.5 };
    this.rotateOffset = { x: 12.5, y: 12.5 };
    this.lifespan = 40;
  }
  this.move = function() { 
    this.lifespan--;
  }
});

module.exports = Explosion;