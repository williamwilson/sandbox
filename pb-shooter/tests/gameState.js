var originalRequire = require;
require = function(module) {
  delete originalRequire.cache[module];
  return originalRequire(module);
}

var GameState = require('../gameState.js'),
  Vector = require('../geometry.js').Vector,
  Bug = require('../bug.js'),
  bus = require('../bus.js');

describe("GameState", function() {
  it("constructor should produce a valid GameState", function() { 
    var state = new GameState();
    GameState.validate(state); 
  });
  it("constructor should copy provided GameState data", function() {
    var data = {
      time: 1,
      bugs: [{}],
      bugCooldown: 63
    };
    GameState.validate(data);
    var state = new GameState(data);
    expect(state.time).toBe(1, 'Should have copied the provided time');
    expect(state.bugs.length).toBe(1, 'Should have copied the provided bug list');
    expect(state.bugCooldown).toBe(63, 'Should have copied the provided bugCooldown');
  });
  it("should tick", function() { 
    var firstState = new GameState();
    var nextState = firstState.tick();

    expect(firstState.time).toBe(0, 'Should not have modified original state time');
    expect(firstState.bugCooldown).toBe(63, 'Should not have modified original state bug cooldown');

    expect(nextState.time).toBe(1, 'Should have ticked to time 1');
    expect(nextState.bugCooldown).toBe(62, 'Should have ticked bugCooldown to be 984');

    nextState = nextState.tick();

    expect(nextState.time).toBe(2, 'Should have ticked to time 2');
    expect(nextState.bugCooldown).toBe(61, 'Should have ticked bugCooldown to be 968');
  });
  it("should return data without functions", function() {
    var state = new GameState();
    state.tick();

    var data = state.toData();
    GameState.validate(data);
    expect(data.toData).toBe(undefined, 'Should not have had toData function');
  });
  it("should add a player", function() {
    var state = new GameState();
    state.addPlayer({id: 123});
    expect(state.players.length).toBe(1);
  });
  it("should leave a player where he was when there were no inputs", function() {
    var state = new GameState();
    state.addPlayer({id: 123, position: {x: 100, y: 100}});
    state = state.tick();
    expect(state.players.length).toBe(1);
  });
  it("should update a player's inputs", function() {
    var state = new GameState();
    state.addPlayer({id: 123, position: {x: 100, y: 100}});
    for(var i = 0; i < 100; i++) {
      state = state.tick();
    }

    state.updatePlayer({id: 123, inputs: {mouse: {x: 200, y: 200 }}});
    state = state.tick();
    expect(state.players[0].inputs).toEqual({mouse: {x: 200, y: 200}});
  });
  it("should move a player towards his mouse input", function() {
    var state = new GameState();
    state.addPlayer({id: 123, position: {x: 100, y: 100}});
    for(var i = 0; i < 100; i++) {
      state = state.tick();
    }

    state.updatePlayer({id: 123, inputs: {mouse: {x: 200, y: 200 }}});
    state = state.tick();
    
    expect(Math.floor(state.players[0].position.x)).toBe(102, 'Should have moved player towards target');
    expect(Math.floor(state.players[0].position.y)).toBe(102, 'Should have moved player towards target');
  });
  it("should reset the bug cooldown after spawning a bug", function() {
    var state = new GameState();
    while(state.bugs.length < 1) {
      state = state.tick();
    }
    expect(state.bugCooldown).toBe(63);
  });
  it("should decrement a player's laser cooldown", function() {
    var state = new GameState();
    state.addPlayer({id: 123, position: {x: 100, y:100 }, laserCooldown: 30});
    state = state.tick();
    expect(state.players[0].laserCooldown).toBe(29, "Should have decremented the player's laser cooldown");
  });
  it("should not spawn a laser when a player's laser cooldown is up but mouse is not down", function() {
    var state = new GameState();
    state.addPlayer({id: 123, position: {x: 100, y:100 }, laserCooldown: 0});
    state.updatePlayer({id: 123, inputs: {mouse: {x: 200, y:200 }}});
    state = state.tick();
    expect(state.lasers.length).toBe(0, 'Should not have spawned a laser');
  });
  it("should move a laser towards its target", function() {
    var state = new GameState();
    state.spawnLaser({x: 100, y: 100}, {x: 200, y:200}, '123ABC');
    state = state.tick();
    expect(state.lasers.length).toBe(1, 'Should have kept laser');
    expect(Math.floor(state.lasers[0].position.x)).toBe(107, 'Should have moved laser towards its target');
    expect(Math.floor(state.lasers[0].position.y)).toBe(107, 'Should have moved laser towards its target');
  });
  it("should detect a collision between a laser and a bug", function() {
    var oldSpawnBug = GameState.spawnBug;
    var bugSpawned = false;

    GameState.spawnBug = function() {
      if (bugSpawned)
        return;

      bugSpawned = true;

      var target = {x: 200, y: 200};
      var origin = {x: 150, y: 150};
      var vector = Vector.fromPoints(origin, target);

      var bug = new Bug(origin, vector);
      this.bugs.push(bug);
    };

    try {
      var state = new GameState();
      state.addPlayer({id: 123, position: {x: 100, y: 100 }, laserCooldown: 1});
      state.updatePlayer({id: 123, inputs: { mouse: { x: 200, y: 200, leftDown: true }}});
      for(var i = 0; i < 9; i++) {
        state = state.tick();        
      }

      expect(state.lasers.length).toBe(0, 'Should have removed the collided laser');
      expect(state.bugs.length).toBe(0, 'Should have removed the collided bug');
      expect(state.explosions.length).toBe(1, 'Should have added an explosion');

      state = state.tick();
      expect(state.explosions.length).toBe(1, 'Should have kept the explosion');
      expect(state.explosions[0].lifespan).toBe(39, "Should have ticked down the explosion's lifespan");
    }
    finally {
      GameState.spawnBug = oldSpawnBug;
    }
  });
  it("should detect a collision between a player and a bug", function() {
    var oldSpawnBug = GameState.spawnBug;
    var bugSpawned = false;

    GameState.spawnBug = function() {
      if (bugSpawned)
        return;

      bugSpawned = true;

      var target = {x: 100, y: 100};
      var origin = {x: 75, y: 75};
      var vector = Vector.fromPoints(origin, target);

      var bug = new Bug(origin, vector);
      this.bugs.push(bug);
    };

    try {
      var state = new GameState();
      state.addPlayer({id: 123, position: {x: 100, y: 100 } });
      state.updatePlayer({id: 123, inputs: { mouse: { x: 100, y: 100 }}});
      for(var i = 0; i < 4; i++) {
        state = state.tick();        
      }

      expect(state.lasers.length).toBe(0, 'Should have removed the collided laser');
      expect(state.bugs.length).toBe(0, 'Should have removed the collided bug');
      expect(state.explosions.length).toBe(1, 'Should have added an explosion');

      state = state.tick();
      expect(state.explosions.length).toBe(1, 'Should have kept the explosion');
      expect(state.explosions[0].lifespan).toBe(39, "Should have ticked down the explosion's lifespan");
    }
    finally {
      GameState.spawnBug = oldSpawnBug;
    }
  });
  it("should detect collisions between a player and another player's laser", function() {
    var state = new GameState();
    state.addPlayer({id: '123ABC', position: {x: 200, y: 200 }, laserCooldown: 500});
    state.updatePlayer({id: '123ABC', inputs: { mouse: {x: 200, y: 200 } }});
    for(var i = 0; i < 100; i++) {
      state = state.tick();
    }
    state.addPlayer({id: '456ABC', position: {x: 100, y: 100}});
    state.updatePlayer({id: '456ABC', inputs: { mouse: {x: 200, y: 200, leftDown: true} }});
    state.players[1].laserCooldown = 1;

    var log = [];
    bus.on('log', function(message) {
      log.push(message);
    });

    for(var i = 0; i < 14; i++) {
      state = state.tick();
    }

    expect(state.players.length).toBe(1, 'Should have destroyed player 1');
    expect(state.players[0].id).toBe('456ABC', 'Should have destroyed player 1');
    expect(state.lasers.length).toBe(0, 'Should have removed the laser');
    expect(state.explosions.length).toBe(1, 'Should have created an explosion');
    expect(log.length).toBe(1, 'Should have logged death by laser');
    expect(log[0]).toContain('456ABC killed 123ABC with a goddamned laser!', 'Should have logged death by laser');
  });
});