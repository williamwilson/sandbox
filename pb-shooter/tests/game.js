var originalRequire = require;
require = function(module) {
  delete originalRequire.cache[module];
  return originalRequire(module);
}

var 
  Game = require('../game.js'),
  GameState = require('../gameState.js'),
  Vector = require('../geometry.js').Vector,
  Bug = require('../bug.js');

describe("Game", function() {
  it("should start at time 0", function() {
    var game = new Game();

    expect(game.time).toBe(0, 'time should have been 0');
    GameState.validate(game.state);
    expect(game.states.length).toBe(1, 'should have saved first state');
  });
  it("should tick", function() {
    var game = new Game();
    game.tick();

    expect(game.time).toBe(1, 'time should have been 1');
    expect(game.state.time).toBe(1, 'state time should have been 1');
    expect(game.states.length).toBe(2, 'should have 2 game states');

    game.tick();

    expect(game.time).toBe(2, 'time should have been 2');
    expect(game.state.time).toBe(2, 'state time should have been 2');
    expect(game.states.length).toBe(3, 'should have 3 game states');
  });
  it("should sync old game states", function() {
    var game = new Game();
    for (var i = 0; i < 9; i++) {
      game.tick();
    }

    expect(game.states.length).toBe(10, 'should have 10 game states');

    var state5 = game.states[4];
    state5.bugCooldown = 31;

    game.sync(state5);
    expect(game.states.length).toBe(10, 'should have 10 game states after sync');
    expect(game.states[4].bugCooldown).toBe(31, 'should have replaced that game state');
    expect(game.states[5].bugCooldown).toBe(30, 'should have ticked up from replaced game state');
  });
  it("should return undefined client states when delay hasn't been met", function() {
    var game = new Game();
    for (var i = 0; i < 4; i++) {
      game.tick();
    }

    expect(game.time).toBe(4, 'time should have been 4');
    expect(game.state.time).toBe(4, 'state time should have been 4');
    expect(game.states.length).toBe(5, 'should have 5 game states');

    expect(game.clientState).toBe(undefined, 'should be returning a null client state (not ready yet)');
  });
  it("should delay the client by 5 states", function() {
    var game = new Game();
    for(var i = 0; i < 5; i++) {
      game.tick();
    }

    expect(game.time).toBe(5, 'time should have been 5');
    expect(game.state.time).toBe(5, 'state time should have been 5');
    expect(game.states.length).toBe(6, 'should have 6 game states');

    expect(game.clientState.time).toBe(0, 'should be sending clients state 0');
  });
  it("should spawn a bug after one second", function() {
    var game = new Game();
    for(var i = 0; (i*16) < 1000; i++) {
      game.tick();
    }
    
    expect(game.state.bugs.length).toBe(1);
  });
  it("should inflate a GameState object it receives through .sync", function() {
    var game = new Game();
    game.sync({
      time: 0,
      bugs: [],
      bugCooldown: 10
    });
    game.tick();

    expect(game.state.time).toBe(1);
    expect(game.state.bugs.length).toBe(0);
    expect(game.state.bugCooldown).toBe(9, 'should have copied bug cooldown and ticked it down');
  });
  it("should spawn a player at the player origin", function() {
    var game = new Game();
    for(var i = 0; i < 100; i++) {
      game.tick();
    }

    var player = { id: 123 };
    game.addPlayer(player);
    expect(game.players[123]).toBe(player);
    expect(game.state.players.length).toBe(1);
    expect(game.state.players[0].position.x).toBe(100);
    expect(game.state.players[0].position.y).toBe(100);
  });
  it("should leave a player where he was when there are no inputs", function() {
    var game = new Game();
    for(var i = 0; i < 100; i++) {
      game.tick();
    }

    var player = { id: 123 };
    game.addPlayer(player);
    game.tick();

    expect(game.players[123]).toBe(player);
    expect(game.state.players.length).toBe(1);
    expect(game.state.players[0].position.x).toBe(100);
    expect(game.state.players[0].position.y).toBe(100);
  });
  it("should move a player towards his mouse input", function() {
    var game = new Game();
    for(var i = 0; i < 100; i++) {
      game.tick();
    }

    var player = { id: 123 };
    game.addPlayer(player);
    game.tick();

    player.inputs = { mouse: { x: 200, y: 200 } };
    game.updatePlayer(player);
    game.tick();
    expect(Math.floor(game.state.players[0].position.x)).toBe(102, 'Should have moved player towards his mouse input');
    expect(Math.floor(game.state.players[0].position.y)).toBe(102, 'Should have moved player towards his mouse input');
    
    game.updatePlayer(player);    
    game.tick();
    expect(Math.floor(game.state.players[0].position.x)).toBe(104, 'Should have moved player towards his mouse input');
    expect(Math.floor(game.state.players[0].position.y)).toBe(104, 'Should have moved player towards his mouse input');
  });
  it("should add a player on click if he wasn't already there", function() {
    var game = new Game();
    for(var i = 0; i < 100; i++) {
      game.tick();
    }

    game.playerClick('123ABC', {x: 100, y: 100});
    expect(game.state.players.length).toBe(1);
    expect(game.state.players[0].position.x).toBe(100, 'Should have spawned player at click point');
    expect(game.state.players[0].position.y).toBe(100, 'Should have spawned player at click point');
  });
  it("should not add a new player on click when he was already there", function() {
    var game = new Game();
    for(var i = 0; i < 100; i++) {
      game.tick();
    }

    game.playerClick('123ABC', {x: 100, y: 100});
    expect(game.state.players.length).toBe(1, 'Should have added a player');
    expect(game.state.players[0].position.x).toBe(100, 'Should have spawned player at click point');
    expect(game.state.players[0].position.y).toBe(100, 'Should have spawned player at click point');

    game.tick();
    game.playerClick('123ABC', {x: 200, y: 200});
    expect(game.state.players.length).toBe(1, 'Should not have added a second player');
    expect(game.state.players[0].position.x).toBe(100, 'Should not have moved player');
    expect(game.state.players[0].position.y).toBe(100, 'Should not have moved player');
  });
  it("should not add a new player on an updatePlayer tick", function() {
    var game = new Game();
    for(var i = 0; i < 100; i++) {
      game.tick();
    }

    game.updatePlayer({id: '123ABC', inputs: { mouse:  {x: 100, y:100 }}});
    expect(game.players['123ABC']).toBe(undefined, 'Should not have added a player');
    expect(game.state.players.length).toBe(0, 'Should not have added a player');
  });
  it("should decrement a new player's laser cooldown", function() {
    var game = new Game();
    for(var i = 0; i < 100; i++) {
      game.tick();
    }

    game.playerClick('123ABC', {x: 100, y: 100});
    expect(game.state.players[0].laserCooldown).toBe(30);

    game.tick();
    expect(game.state.players[0].laserCooldown).toBe(29, "should have decremented the player's laser cooldown");
  });
  it("should not fire a laser when a player's laser cooldown is up and mouse is not down", function() {
    var game = new Game();
    for(var i = 0; i < 100; i++) {
      game.tick();
    }

    game.playerClick('123ABC', {x: 100, y:100 });
    game.updatePlayer({id: '123ABC', inputs: { mouse: {x: 100, y:100 }} });
    expect(game.state.lasers.length).toBe(0, 'Should not have fired a laser');
  });
  it("should fire a laser when a player's laser cooldown is up and mouse is down", function() {
    var game = new Game();

    game.playerClick('123ABC', {x: 100, y: 100 });
    game.updatePlayer({id: '123ABC', inputs: { mouse: {x: 100, y:100, leftDown: true}} });
    game.state.players[0].laserCooldown = 0;
    game.tick();

    expect(game.state.lasers.length).toBe(1, 'Should have spawned a laser');
    expect(game.state.players[0].laserCooldown).toBe(30, "Should have reset player's laser cooldown");
  });
  it("should detect a collision between a laser and a bug", function() {
    var game = new Game();
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
      game.playerClick('123ABC', {x: 100, y: 100 });
      game.updatePlayer({id: '123ABC', inputs: { mouse: {x: 200, y: 200, leftDown: true}} });
      game.tick();
      game.state.players[0].laserCooldown = 0;

      for(var i = 0; i < 7; i++) {
        game.tick();
      }

      game.tick();
      expect(game.state.lasers.length).toBe(0, 'Should have removed the collided laser');
      expect(game.state.bugs.length).toBe(0, 'Should have removed the collided bug');
      expect(game.state.explosions.length).toBe(1, 'Should have added an explosion');

      game.tick();
      expect(game.state.explosions.length).toBe(1, 'Should have kept the explosion');
      expect(game.state.explosions[0].lifespan).toBe(39, "Should have ticked down the explosion's lifespan");
    }
    finally {
      GameState.spawnBug = oldSpawnBug;
    }
  });
  it("should detect a collision between a bug and a player", function() {
    var game = new Game();
    var oldSpawnBug = GameState.spawnBug;
    var bugSpawned = false;

    GameState.spawnBug = function() {
      if (bugSpawned)
        return;

      bugSpawned = true;

      var target = {x: 200, y: 200};
      var origin = {x: 75, y: 75};
      var vector = Vector.fromPoints(origin, target);

      var bug = new Bug(origin, vector);
      this.bugs.push(bug);
    }

    try {
      game.playerClick('123ABC', {x: 100, y: 100});
      game.updatePlayer({id: '123ABC', inputs: { mouse: {x: 100, y: 100}}});
      
      for(var i = 0; i < 18; i++) {
        game.tick();
      }

      game.tick();

      expect(game.state.players.length).toBe(0, 'Should have removed the collided player');
      expect(game.state.bugs.length).toBe(0, 'Should have removed the collided bug');
      expect(game.state.explosions.length).toBe(1, 'Should have added an explosion');
    }
    finally {
      GameState.spawnBug = oldSpawnBug;
    }
  });
  it("should ignore collisions between a player and his own lasers", function() {
    var game = new Game();
    game.playerClick('123ABC', {x: 100, y: 100});
    game.updatePlayer({id: '123ABC', inputs: { mouse: {x: 100, y: 100, leftDown: true} }});
    game.tick();
    game.state.players[0].laserCooldown = 0;
    game.tick();

    expect(game.state.players.length).toBe(1, 'Should not have removed the collided player');
    expect(game.state.lasers.length).toBe(1, 'Should not have removed the collided laser');
    expect(game.state.explosions.length).toBe(0, 'Should not have added an explosion');
  });
  it("should detect collisions between a player and another player's laser", function() {
    var game = new Game();
    game.playerClick('123ABC', {x: 100, y: 100});
    game.updatePlayer({id: '123ABC', inputs: { mouse: {x: 200, y: 200 } }});
    for(var i = 0; i < 100; i++) {
      game.tick();
    }
    game.playerClick('456ABC', {x: 100, y: 100});
    game.updatePlayer({id: '456ABC', inputs: { mouse: {x: 200, y: 200, leftDown: true} }});
    game.tick();
    game.state.players[1].laserCooldown = 0;
    for(var i = 0; i < 13; i++) {
      game.tick();
    }

    // console.log('\nPLAYERS\n', game.state.players);
    // console.log('\nLASERS\n', game.state.lasers);
  });
}); 