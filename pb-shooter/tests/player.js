var originalRequire = require;
require = function(module) {
  delete originalRequire.cache[module];
  return originalRequire(module);
}

var Player = require('../player.js');

describe("Player", function() {
  it("should spawn a player without an angle", function() {
    var player = new Player({x: 100, y: 100});
    expect(player.angle).toBe(0);
  });
  it("should move a player with no inputs", function() {
    var player = new Player({x: 100, y: 100});
    player.move({x: 200, y: 200});
    expect(Math.floor(player.position.x)).toBe(104);
    expect(Math.floor(player.position.y)).toBe(104);
  });
});