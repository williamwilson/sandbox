var originalRequire = require;
require = function(module) {
  delete originalRequire.cache[module];
  return originalRequire(module);
}

var Laser = require('../laser.js');

describe("Laser", function() {
  it("should fail to spawn a laser without a position", function() {
    expect(function() {
      new Laser()
    }).toThrow(new Error("first argument to Laser must be a position with x and y, it was undefined"));
  });
  it("should fail to spawn a laser without a target", function() {
    expect(function() {
      new Laser({x: 100, y: 100})
    }).toThrow(new Error("second argument to Laser must be a target with x and y, it was undefined"));
  });
  it("should fail to spawn a laser without a player id", function() {
    expect(function() {
      new Laser({x: 100, y: 100}, {x: 200, y: 200});
    }).toThrow(new Error("third argument to Laser must be a player id"));
  });
  it("should move towards its target", function() {
    var laser = new Laser({x: 100, y: 100}, {x: 200, y: 200}, '123ABC');
    laser.move();
    expect(Math.floor(laser.position.x)).toBe(107);
    expect(Math.floor(laser.position.y)).toBe(107);
  });
});