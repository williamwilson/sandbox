var 
  geometry = require('./geometry.js'),
  Map = geometry.Map,
  Vector = geometry.Vector,
  augment = require('augment'),
  Bug = require('./bug.js'),
  extend = require('extend'),
  Player = require('./player.js'),
  Laser = require('./laser.js'),
  SAT = require('sat'),
  Explosion = require('./explosion.js'),
  bus = require('./bus');

var GameState = augment(Object, function() {
  this.constructor = function(data) {
    var self = this;

    this.bugs = [];
    this.bugCooldown = 63;
    this.players = [];
    this.lasers = [];
    this.explosions = [];
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
    this.updateExplosions();
    this.checkCollisions();
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
  this.updateExplosions = function() {
    for(var i = 0; i < this.explosions.length; i++) {
      var explosion = this.explosions[i];
      var lifespan = explosion.lifespan;

      if (!(explosion instanceof Explosion)) {
        explosion = new Explosion(explosion.position);
        explosion.lifespan = lifespan;
        this.explosions[i] = explosion;
      }
      explosion.move();

      if (explosion.lifespan <= 0) {
        this.explosions.splice(i, 1); i--;
      }
    }
  };
  this.getPlayerById = function(id) {
    for(var k = 0; k < this.players.length; k++) {
      if (this.players[k].id == id) {
        return this.players[k];
      }
    }
    return undefined;
  }
  this.checkCollisions = function() {
    for(var i = 0; i < this.lasers.length; i++) {
      var laser = this.lasers[i];
      for (var j = 0; j < this.bugs.length; j++) {
        var bug = this.bugs[j];

        var collision = this.checkCollision(laser, bug);
        if (collision.collided) {
          this.lasers.splice(i, 1); i--;
          this.bugs.splice(j, 1); j--;
          this.explosions.push(new Explosion(bug.position, bug.vector));
          
          bus.log(this.getPlayerById(laser.playerId).name + ' killed a bug!');
        }
      }
    }

    for(var i = 0; i < this.players.length; i++) {
      var player = this.players[i];
      for(var j = 0; j < this.bugs.length; j++) {
        var bug = this.bugs[j];

        var collision = this.checkCollision(player, bug);
        if (collision.collided) {
          this.players.splice(i, 1); i--;
          this.bugs.splice(j, 1); j--;
          this.explosions.push(new Explosion(bug.position, bug.vector));
          bus.log(player.name + ' was killed by a bug!');
        }
      }
    }

    for(var i = 0; i < this.players.length; i++) {
      var player = this.players[i];
      for(var j = 0; j < this.lasers.length; j++) {
        var laser = this.lasers[j];


        var collision = this.checkPolygonCollision(player, laser);
        if (collision.collided) {

          if (player.id != laser.playerId) {
            this.players.splice(i, 1); i--;
            this.lasers.splice(j, 1); j--;
            this.explosions.push(new Explosion(player.position, player.vector));
            bus.log(this.getPlayerById(laser.playerId).name + ' killed ' + player.name + ' with a goddamned laser!');
          }
        }
      }
    }
  };
  this.checkPolygonCollision = function(unit1, unit2) {
    var response = new SAT.Response();
    var collided = SAT.testPolygonPolygon(unit1.hitBox(), unit2.hitBox(), response);
    return {
      collided: collided,
      response: response
    };
  }
  this.checkCollision = function(unit1, unit2) {
    var response = new SAT.Response();
    var collided = SAT.testPolygonCircle(unit1.hitBox(), unit2.hitBox(), response);
    return {
      collided: collided,
      response: response
    };
  };
  this.updatePlayers = function() {
    for(var i = 0; i < this.players.length; i++) {
      var player = this.players[i];
      var inputs = player.inputs;
      var id = player.id;
      var name = player.name;
      var laserCooldown = player.laserCooldown;

      if (!(player instanceof Player)) {
        player = new Player(player.position, player.vector);
        player.id = id;
        player.name = name;
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
            {x: player.position.x - player.heading.x, y: player.position.y - player.heading.y },
            player.id
          );
        }
      }

      if (inputs && inputs.mouse) {
        player.move(inputs.mouse);
      }
    }
  };
  this.spawnLaser = function(origin, target, firingPlayerId) {
    this.lasers.push(new Laser(origin, target, firingPlayerId));
  };
  this.updateLasers = function() {
    for(var i = 0; i < this.lasers.length; i++) {
      var laser = this.lasers[i];

      if (!(laser instanceof Laser)) {
        laser = new Laser(laser.position, { x: laser.position.x + laser.heading.x, y: laser.position.y + laser.heading.y }, laser.playerId);
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
      lasers: this.lasers,
      explosions: this.explosions
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