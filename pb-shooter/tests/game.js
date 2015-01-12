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
    state5.bugCooldown = 500;

    game.sync(state5);
    expect(game.states.length).toBe(10, 'should have 10 game states after sync');
    expect(game.states[4].bugCooldown).toBe(500, 'should have replaced that game state');
    expect(game.states[5].bugCooldown).toBe(484, 'should have ticked up from replaced game state');
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
      bugCooldown: 127
    });
    game.tick();

    expect(game.state.time).toBe(1);
    expect(game.state.bugs.length).toBe(0);
    expect(game.state.bugCooldown).toBe(111);
  });
});