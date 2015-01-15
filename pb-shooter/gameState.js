var 
  geometry = require('./geometry.js'),
  Map = geometry.Map,
  Vector = geometry.Vector,
  augment = require('augment'),
  Bug = require('./bug.js'),
  extend = require('extend'),
  Player = require('./player.js'),
  Laser = require('./laser.js');

var GameState = augment(Object, function() {
  this.constructor = function(data) {
    var self = this;

    this.bugs = [];
    this.bugCooldown = 63;
    this.players = [];
    this.lasers = [];
    this.time = 0;
    this.fromData(data);
    this.map = new Map(800, 500);
  };
  this.spawnBug = function() {
    GameState.spawnBug.call(this);
  };
  this._tick = function() {
    this.time++;
    this.updateBugs();
    this.updatePlayers();
    this.updateLasers();
    return this;
  };
  this.addPlayer = function(player) {
    this.players.push(player);
  };
  this.updatePlayer = function(player) {
    for(var i = 0; i < this.players.length; i++) {
      if (this.players[i].id === player.id) {
        this.players[i].inputs = player.inputs;
      }
    }
  };
  this.updatePlayers = function() {
    for(var i = 0; i < this.players.length; i++) {
      var player = this.players[i];
      var inputs = player.inputs;
      var id = player.id;
      var laserCooldown = player.laserCooldown;

      if (!(player instanceof Player)) {
        player = new Player(player.position, player.vector);
        player.id = id;
        player.inputs = inputs;
        player.laserCooldown = laserCooldown;
        this.players[i] = player;
      }

      if (laserCooldown > 0)
        player.laserCooldown--;
      else {
        if (inputs && inputs.mouse.leftDown) {
          player.laserCooldown = 30;
          this.spawnLaser(
            {x: player.position.x, y: player.position.y},
            {x: player.position.x - player.heading.x, y: player.position.y - player.heading.y }
          );
        }
      }

      if (inputs && inputs.mouse) {
        player.move(inputs.mouse);
      }
    }
  };
  this.spawnLaser = function(origin, target) {
    this.lasers.push(new Laser(origin, target));
  };
  this.updateLasers = function() {
    for(var i = 0; i < this.lasers.length; i++) {
      var laser = this.lasers[i];

      if (!(laser instanceof Laser)) {
        laser = new Laser(laser.position, { x: laser.position.x + laser.heading.x, y: laser.position.y + laser.heading.y });
        this.lasers[i] = laser;
      }

      laser.move();
      if (this.map.pointOffMap(laser.position)) {
        this.lasers.splice(i, 1);
        i--;
      }
    }
  };
  this.updateBugs = function() {
    this.bugCooldown -= 1;

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
      bugCooldown: this.bugCooldown,
      players: this.players,
      lasers: this.lasers
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

  this.bugCooldown = 63;
    
  var target = this.map.getRandomPoint();
  var center = this.map.center();
  var vector = Vector.fromPoints(center, target);

  var bug = new Bug(center, vector);
  this.bugs.push(bug);
}

module.exports = GameState;