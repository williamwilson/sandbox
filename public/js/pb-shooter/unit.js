(function(window) {
  var Point = window.Point;
  var Vector = window.Vector;
  var Inputs = window.Inputs;
  
  window.Unit = augment(Object, function() {
    this.constructor = function(position, vector) {
      if (typeof position != "object" || !(position instanceof Point))
        throw new Error("position was not a Point, it was: " + position);
      if (typeof position != "object" || !(vector instanceof Vector))
        throw new Error("vector was not a Vector, it was: " + vector);
      
      this.position = position;
      this.angle = vector.angle;
      this.heading = vector.heading;
      this.speed = 2;
    };
    
    this.move = function(overrideSpeed) {
      var moveSpeed = overrideSpeed || this.speed;
      
      var x = this.position.x - (this.heading.x * moveSpeed);
      var y = this.position.y - (this.heading.y * moveSpeed);
      this.position = new Point(x, y);
    }
    
    this.rectangle = function(width, height) {
      if (typeof width != "number")
        throw new Error("width was not a number, it was: " + width);
      if (typeof height != "number")
        throw new Error("height was not a number, it was: " + height);
        
      this.drawOffset = { x: width / 2, y: height / 2 };
    }
    
    this.rectangleHitBox = function() {
      var polygon = new SAT.Polygon(
        new SAT.Vector(this.position.x, this.position.y), [
        new SAT.Vector(-this.drawOffset.x, this.drawOffset.y),
        new SAT.Vector(-this.drawOffset.x, -this.drawOffset.y),
        new SAT.Vector(this.drawOffset.x, -this.drawOffset.y),
        new SAT.Vector(this.drawOffset.x, this.drawOffset.y)]
      );
      polygon.rotate(this.angle * (Math.PI / 180));
      return polygon;
    }
  });
  
  window.Bug = augment(Unit, function (base) {
    this.constructor = function(position, vector) {
      base.constructor.call(this, position, vector);
      this.vector = vector;
      this.speed = 2;
      this.drawOffset = { x: 12.5, y: 12.5 };
      this.rotateOffset = { x: 12.5, y: 12.5 };
    };
    this.hitBox = function() {
      return new SAT.Circle(new SAT.Vector(this.position.x+1, this.position.y+1.5), 8);
    };
  });
  
  window.Player = augment(Unit, function(base) {
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
  
  window.Explosion = augment(Unit, function(base) {
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
  
  window.Laser = augment(Unit, function(base) {
    this.constructor = function(position, vector) {
      base.constructor.call(this, position, vector);
      base.rectangle.call(this, 12, 2);
      this.speed = 10;
    };
    this.hitBox = function() {
      return base.rectangleHitBox.call(this);
    }
  });
  
  window.Game = augment(Object, function() {
    this.constructor = function(map, getInputs) {
      if (typeof map != "object" || !(map instanceof Map))
        throw new Error("map was not a Map, it was: " + map);
      if (typeof getInputs != "object")
        throw new Error("map was not a Map, it was: " + map);
      
      this.getInputs = getInputs;
      this.map = map;
      this.bugs = [];
      this.lasers = [];
      this.explosions = [];
      this.laserCooldown = false;
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
      
      setTimeout(function() {
        self.laserCooldown = false;
      }, 500);
    };
    this.spawnBug = function() {
      var self = this;
      if (self.bugCooldown)
        return;
      self.bugCooldown = true;
        
      var target = this.map.getRandomPoint();
      var center = this.map.center();
      var vector = new Vector(center, target);
    
      setTimeout(function() {
        self.bugCooldown = false;
      }, 750);
    
      var bug = new Bug(center, vector);
      this.bugs.push(bug);
    };
    this.spawnPlayer = function() {
      var target = this.getInputs.mouse();
      var center = this.map.center();
      var vector = new Vector(center, target);
      
      this.player = new Player(center, vector);
      return this.player;
    };
    this.moveUnits = function() {
      this.player.move(this.getInputs.mouse());
      
      for(var i = 0; i < this.bugs.length; i++) {
        this.bugs[i].move();
      }
      
      for(var i = 0; i < this.lasers.length; i++) {
        this.lasers[i].move();
      }
      
      for(var i = 0; i < this.explosions.length; i++) {
        this.explosions[i].move();
      }
    };
    this.tick = function() {
      var mouse = this.getInputs.mouse();
      if (this.getInputs.click())
        this.spawnLaser(this.player.position, mouse);
      if (this.getInputs.spacebar())
        this.spawnBug();
      
      var center = this.map.center();
      var vector = new Vector(center, mouse);
      this.pointerLaser = new Laser(center, vector);
      this.moveUnits();
      
      for(var i = 0; i < this.explosions.length; i++) {
        if (this.explosions[i].lifespan < 1)
          this.explosions.splice(i, 1);
      }
    }
    this.checkCollision = function(unit1, unit2) {
      var response = new SAT.Response();
      var collided = SAT.testPolygonCircle(unit1.hitBox(), unit2.hitBox(), response);
      return {
        collided: collided,
        response: response
      };
    };
    this.checkCollisions = function() {
      for (var i = 0; i < this.lasers.length; i++) {
        var laser = this.lasers[i];
        if (this.map.pointOffMap(laser.position)) {
          this.lasers.splice(i, 1); i--;
        }
      }
      
      for(var i = 0; i < this.lasers.length; i++) {
        for(var j = 0; j < this.bugs.length; j++) {
          var laser = this.lasers[i];
          var bug = this.bugs[j];
          
          var collision = this.checkCollision(laser, bug); 
          if (collision.collided) {
            this.lasers.splice(i, 1); i--;
            this.bugs.splice(j, 1); j--;
            this.explosions.push(new Explosion(bug.position, bug.vector));
          }
        }
      }
      
      for(var i = 0; i < this.bugs.length; i++) {
        var bug = this.bugs[i];
        console.log(collision.response);
        if (collision.collided) {
          this.bugs.splice(i, 1); i--;
          this.explosions.push(new Explosion(bug.position, bug.vector))
        }
      }
    }
  });
})(window);