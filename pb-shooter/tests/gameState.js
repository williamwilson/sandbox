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
      bugCooldown: 984
    };
    GameState.validate(data);
    var state = new GameState(data);
    expect(state.time).toBe(1, 'Should have copied the provided time');
    expect(state.bugs.length).toBe(1, 'Should have copied the provided bug list');
    expect(state.bugCooldown).toBe(984, 'Should have copied the provided bugCooldown');
  });
  it("should tick", function() { 
    var firstState = new GameState();
    var nextState = firstState.tick();

    expect(firstState.time).toBe(0, 'Should not have modified original state time');
    expect(firstState.bugCooldown).toBe(1000, 'Should not have modified original state bug cooldown');

    expect(nextState.time).toBe(1, 'Should have ticked to time 1');
    expect(nextState.bugCooldown).toBe(984, 'Should have ticked bugCooldown to be 984');

    nextState = nextState.tick();

    expect(nextState.time).toBe(2, 'Should have ticked to time 2');
    expect(nextState.bugCooldown).toBe(968, 'Should have ticked bugCooldown to be 968');
  });
  it("should return data without functions", function() {
    var state = new GameState();
    state.tick();

    var data = state.toData();
    GameState.validate(data);
    expect(data.toData).toBe(undefined, 'Should not have had toData function');
  });
});