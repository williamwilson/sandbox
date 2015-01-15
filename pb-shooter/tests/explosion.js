var originalRequire = require;
require = function(module) {
  delete originalRequire.cache[module];
  return originalRequire(module);
}

var Explosion = require('../explosion.js');

describe("Explosion", function() {
  it("should spawn an explosion without an angle", function() {
    var explosion = new Explosion({x: 100, y: 100});
    expect(explosion.angle).toBe(0);
  });
  it("should reduce its lifespan on move", function() {
    var explosion = new Explosion({x: 100, y: 100});
    explosion.move();
    expect(explosion.lifespan).toBe(39);
  });
});