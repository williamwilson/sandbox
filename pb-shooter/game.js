var 
  geometry = require('./geometry.js'),
  Map = geometry.Map,
  Point = geometry.Point,
  Vector = geometry.Vector,
  augment = require('augment'),
  Nanotimer = require('nanotimer'),
  Bug = require('./bug.js'),
  EventEmitter = require('events').EventEmitter;

var Game = augment(Object, function() {
  this.constructor = function(map) {
    if (typeof map != "object" || !(map instanceof Map))
      throw new Error("map was not a Map, it was: " + map);
    var self = this;
    
    this.map = map;
    this.bugs = [];
    this.lasers = [];
    this.explosions = [];
    this.laserCooldown = false;
    this.bugCooldown = true;
    this.bugDelay = 1000;
    this.afterTickHandlers = [];
    this.time = 0;
    this.players = {};
    
    new Nanotimer().setTimeout(function() {
      self.bugCooldown = false;
    }, self, '3s');
  };
  this.afterTick = function(callback) {
    this.afterTickHandlers.push(callback);
  };
  this.spawnLaser = function(origin, target) {
    if (typeof origin != "object" || !(origin instanceof Point))
      throw new Error("origin was not a Point, it was: " + origin);
    if (typeof target != "object" || !(target instanceof Point))
      throw new Error("target was not a Point, it was: " + target);
      
    var self = this;
    if (self.laserCooldown)
      return;
    self.laserCooldown = true;
    
    var vector = new Vector(origin, target);
    
    var laser = new Laser(origin, vector);
    this.lasers.push(laser);
    
    new Nanotimer().setTimeout(function() {
      self.laserCooldown = false;
    }, self, '0.5s');
  };
  this.spawnBug = function() {
    var self = this;
    if (self.bugCooldown)
      return;
    self.bugCooldown = true;
      
    var target = this.map.getRandomPoint();
    var center = this.map.center();
    var vector = new Vector(center, target);
  
    new Nanotimer().setTimeout(function() {
      this.bugDelay = this.bugDelay - 10;
      self.bugCooldown = false;
    }, self, this.bugDelay + 'm');
  
    var bug = new Bug(center, vector);
    this.bugs.push(bug);
  };
  this.tick = function() {
    this.time += 16;
    if (this.bugs.length < 10)
      this.spawnBug();
    
    for(var i = 0; i < this.bugs.length; i++) {
      var bug = this.bugs[i];
      bug.move();
      if (this.map.pointOffMap(bug.position)) {
        this.bugs.splice(i, 1); 
        i--;
      }
    }
    
    for(var i = 0; i < this.explosions.length; i++) {
      this.explosions[i].move();
      if (this.explosions[i].lifespan < 1)
        this.explosions.splice(i, 1);
    }
    
    for(var i = 0; i < this.afterTickHandlers.length; i++) {
      this.afterTickHandlers[i]({
        time: this.time,
        bugs: this.bugs,
        bugCooldown: this.bugCooldown,
        bugDelay: this.bugDelay,
        players: this.players,
        lasers: this.lasers,
        laserCooldown: this.laserCooldown,
        explosions: this.explosions,
      });
    }
    
    var self = this;
    Object.keys(this.players).forEach(function(key) {
      var player = self.players[key];
      
      player.disconnectTimer -= 16;
      if (player.disconnectTimer <= 0)
        delete self.players[key];
    });
  };
  this.start = function() {
    var self = this;
    this.timer = new Nanotimer();
    this.timer.setInterval(function() { 
      self.tick.call(self); 
    }, self, '16m');
  };
  this.setInputs = function(socketId, inputs) {
    if (!this.players[socketId])
      this.players[socketId] = { socketId: socketId };
      
    this.players[socketId].inputs = inputs;
    this.players[socketId].disconnectTimer = 5000;
  };
  this.syncGameState = function(gameState) {
    this.bugs = gameState.bugs;
    this.lasers = gameState.lasers;
    this.explosions = gameState.explosions;
    this.laserCooldown = gameState.laserCooldown;
    this.bugCooldown = gameState.bugCooldown;
    this.bugDelay = gameState.bugDelay;
    this.time = gameState.time;
    this.players = gameState.players;
  }
});

module.exports = Game;