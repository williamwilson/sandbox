var originalRequire = require;
require = function(module) {
  delete originalRequire.cache[module];
  return originalRequire(module);
}

var 
  Game = require('../game.js'),
  GameState = require('../gameState.js');

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
    expect(Math.floor(game.state.players[0].position.x)).toBe(104, 'Should have moved player towards his mouse input');
    expect(Math.floor(game.state.players[0].position.y)).toBe(104, 'Should have moved player towards his mouse input');
    game.tick();
    expect(Math.floor(game.state.players[0].position.x)).toBe(108, 'Should have moved player towards his mouse input');
    expect(Math.floor(game.state.players[0].position.y)).toBe(108, 'Should have moved player towards his mouse input');
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
}); 