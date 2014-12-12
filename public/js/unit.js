(function(window) {
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
  });
  
  window.Point = augment(Object, function() {
    this.constructor = function(x, y) {
      if (typeof x != "number")
        throw new Error("x was not a number, it was: " + x);
      if (typeof y != "number")
        throw new Error("y was not a number, it was: " + y);
        
      this.x = x;
      this.y = y;
    }
  });
  
  window.Map = augment(Object, function() {
    this.constructor = function(width, height) {
      if (typeof width != "number")
        throw new Error("width was not a number, it was: " + width);
      if (typeof height != "number")
        throw new Error("height was not a number, it was: " + height);
      
      this.width = width;
      this.height = height;
    };
    this.getRandomPoint = function() {
      var x = Math.floor(Math.random() * this.width);
      var y = Math.floor(Math.random() * this.height);
      return new Point(x, y);
    };
    this.center = function() {
      return new Point(this.width/2, this.height/2);
    };
  });
  
  window.Vector = augment(Object, function () {
    this.constructor = function(pointA, pointB) {
      if (typeof pointA != "object" || !(pointA instanceof Point))
        throw new Error("pointA was not a number, it was: " + pointA);
      if (typeof pointB != "object" || !(pointB instanceof Point))
        throw new Error("pointB was not a number, it was: " + pointB);
      
      this.pointA = pointA;
      this.pointB = pointB;
      var dx = pointA.x - pointB.x;
      var dy = pointA.y - pointB.y;
      this.distance = Math.sqrt((dx*dx) + (dy*dy));
      this.angle = Math.asin(dy / this.distance) * 180 / Math.PI;
      if (dx < 0)
        this.angle = -this.angle
      this.heading = {x: dx / this.distance, y: dy / this.distance};
    };
  });
  
  window.Bug = augment(Unit, function (base) {
    this.constructor = function(position, vector) {
      base.constructor.call(this, position, vector);
      this.speed = 4;
      this.drawOffset = { x: 12.5, y: 12.5 };
      this.rotateOffset = { x: 12.5, y: 12.5 };
    };
  });
  
  window.Player = augment(Unit, function(base) {
    this.constructor = function(position, vector) {
      base.constructor.call(this, position, vector);
      this.speed = 6;
      this.drawOffset = { x: 12.5, y: 12.5 };
      this.rotateOffset = { x: 16, y: 16 };
    };
    this.move = function(target) {
      var v = new Vector(this.position, target);
      if (v.distance < 3)
        return;
        
      var speed = d3.min([this.speed, v.distance / 10]);
      
      this.angle = v.angle;
      this.heading = v.heading;
      base.move.call(this, speed);
    }
  });
  
  window.Laser = augment(Unit, function(base) {
    this.constructor = function(position, vector) {
      base.constructor.call(this, position, vector);
      this.speed = 10;
      this.drawOffset = { x: 12.5, y: 2.5 };
      this.rotateOffset = { x: 16, y: 5 };
    };
  });
  
  window.Inputs = augment(Object, function() {
    this.constructor = function(inputs) {
      if (typeof inputs != "object")
        throw new Error("inputs was not an object, it was: " + inputs);
      if (typeof inputs.mouse != "function")
        throw new Error("inputs.mouse was not a function, it was: " + inputs.mouse);
      if (typeof inputs.click != "function")
        throw new Error("inputs.click was not a function, it was: " + inputs.click);
      if (typeof inputs.spacebar != "function")
        throw new Error("inputs.spacebar was not a function, it was: " + inputs.spacebar);
        
      this.mouse = inputs.mouse;
      this.click = inputs.click;
      this.spacebar = inputs.spacebar;
    };
  });
  
  window.Game = augment(Object, function() {
    this.constructor = function(map, getInputs) {
      if (typeof map != "object" || !(map instanceof Map))
        throw new Error("map was not a Map, it was: " + map);
      if (typeof getInputs != "object")
        throw new Error("map was not a Map, it was: " + map);
      
      this.getInputs = getInputs;
      this.map = map;
      this.units = [];
      this.lasers = [];
      this.laserCooldown = false;
    };
    this.spawnLaser = function(origin, target) {
      if (typeof origin != "object" || !(origin instanceof Point))
        throw new Error("origin was not a Point, it was: " + origin);
      if (typeof target != "object" || !(target instanceof Point))
        throw new Error("target was not a Point, it was: " + target);
        
      var self = this;
      self.laserCooldown = true;
      
      var vector = new Vector(origin, target);
      
      var laser = new Laser(origin, vector);
      this.lasers.push(laser);
      
      setTimeout(function() {
        self.laserCooldown = false;
      }, 500);
    };
    this.spawnBug = function() {
      var target = this.map.getRandomPoint();
      var center = this.map.center();
      var vector = new Vector(center, target);
    
      var bug = new Bug(center, vector);
      this.units.push(bug);
    };
    this.spawnPlayer = function() {
      var target = this.getInputs.mouse();
      if (typeof target != "object" || !(target instanceof Point))
        throw new Error("getInputs.mouse() was not a point, it was: " + target);
      
      var center = this.map.center();
      var vector = new Vector(center, target);
      
      this.player = new Player(center, vector);
      return this.player;
    };
    this.moveUnits = function() {
      this.player.move(this.getInputs.mouse());
      
      for(var i = 0; i < this.units.length; i++) {
        this.units[i].move();
      }
      
      for(var i = 0; i < this.lasers.length; i++) {
        this.lasers[i].move();
      }
    };
    this.tick = function() {
      if (this.getInputs.click()) {
        if (!this.laserCooldown) {
          this.spawnLaser(this.player.position, this.getInputs.mouse());
        }
      }
      
      if (this.getInputs.spacebar()) {
        this.spawnBug();
      }
      
      this.moveUnits();
    }
  });
})(window);