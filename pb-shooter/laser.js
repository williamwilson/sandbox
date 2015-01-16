var 
  augment = require('augment'),
  Unit = require('./unit.js'),
  geometry = require('./geometry.js'),
  Vector = geometry.Vector;

var Laser = augment(Unit, function(base) {
  this.constructor = function(position, target, playerId) {
    if (!position || !position.x || !position.y) { throw new Error("first argument to Laser must be a position with x and y, it was " + position); }
    if (!target || !target.x || !target.y) { throw new Error("second argument to Laser must be a target with x and y, it was " + target); }
    if (!playerId) { throw new Error("third argument to Laser must be a player id"); }

    var vector = Vector.fromPoints(position, target);

    base.constructor.call(this, position, vector);
    base.rectangle.call(this, 12, 2);
    this.speed = 10;
    this.playerId = playerId;
  };
  this.hitBox = function() {
    return base.rectangleHitBox.call(this);
  }
});

module.exports = Laser;