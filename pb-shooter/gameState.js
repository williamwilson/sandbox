var 
  geometry = require('./geometry.js'),
  Map = geometry.Map,
  Vector = geometry.Vector,
  augment = require('augment'),
  Bug = require('./bug.js'),
  extend = require('extend');

var GameState = augment(Object, function() {
  this.constructor = function(data) {
    var self = this;

    this.bugs = [];
    this.bugCooldown = 1000;
    this.time = 0;
    this.fromData(data);
    this.map = new Map(800, 500);
  };
  this.spawnBug = function() {
    GameState.spawnBug.call(this);
  };
  this._tick = function() {
    this.time++;
    this.bugCooldown -= 16;

    if (this.bugs.length < 10)
      this.spawnBug();
    
    for(var i = 0; i < this.bugs.length; i++) {
      var bug = this.bugs[i];

      if (!(bug instanceof Bug)) {
        bug = new Bug(bug.position, bug.vector);
        this.bugs[i] = bug;
      }

      bug.move();
      if (this.map.pointOffMap(bug.position)) {
        this.bugs.splice(i, 1); 
        i--;
      }
    }

    return this;
  };
  this.tick = function() {
    return new GameState(this.toData())._tick();
  };
  this.fromData = function(data) {
    extend(true, this, data);
  };
  this.toData = function() {
    return { 
      time: this.time,
      bugs: this.bugs,
      bugCooldown: this.bugCooldown
    };
  };
});
GameState.validate = function(obj) {
  if (typeof obj === "undefined")
    throw new Error("obj was not a GameState, it was undefined");

  var requiredProperties = ['time', 'bugs', 'bugCooldown'];
  for(var i = 0; i < requiredProperties.length; i++) { 
    var property = requiredProperties[i];
    if (typeof obj[property] === "undefined") {
      throw new Error("obj was not a GameState, it was missing " + property);
    }
  }
};
GameState.spawnBug = function() {
  if (this.bugCooldown > 0)
    return;

  this.bugCooldown = 1000;
    
  var target = this.map.getRandomPoint();
  var center = this.map.center();
  var vector = Vector.fromPoints(center, target);

  var bug = new Bug(center, vector);
  this.bugs.push(bug);
}

module.exports = GameState;