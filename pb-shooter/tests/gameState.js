var originalRequire = require;
require = function(module) {
  delete originalRequire.cache[module];
  return originalRequire(module);
}

var GameState = require('../gameState.js');

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
    
    expect(Math.floor(state.players[0].position.x)).toBe(104, 'Should have moved player towards target');
    expect(Math.floor(state.players[0].position.y)).toBe(104, 'Should have moved player towards target');
  });
  it("should reset the bug cooldown after spawning a bug", function() {
    var state = new GameState();
    while(state.bugs.length < 1) {
      state = state.tick();
    }
    expect(state.bugCooldown).toBe(63);
  });
});