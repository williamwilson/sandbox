var originalRequire = require;
require = function(module) {
  delete originalRequire.cache[module];
  return originalRequire(module);
}

var d3Utils = require('../d3Utils.js');

describe("d3Utils", function() {
  it("should validate drawable", function() {
    expect(function() {
      d3Utils.buildTransformString({g: 'hey'});
    }).toThrow(new Error("obj was not drawable, it was missing position"));
  });
  it("should default angle, rotateX, rotateY to 0", function() {
    var result = d3Utils.buildTransformString({ position: { x: 1, y: 2 } });
    expect(result).toBe("translate(1,2) rotate(0 0 0)");
  });
  it("should apply the drawable's drawOffset if present", function() {
    var result = d3Utils.buildTransformString({ 
      position: { x: 10, y: 10 },
      drawOffset: {x: 5, y: 4}
    });
    expect(result).toBe("translate(5,6) rotate(0 5 4)");
  });
});