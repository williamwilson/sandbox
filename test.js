var SAT = require('sat');

var position = {
  x: 364,
  y: 251
};
var drawOffset = {
  x: 12.5,
  y: 12.5
};
var angle = 72

var square = new SAT.Polygon(
  new SAT.Vector(position.x, position.y), [
  new SAT.Vector(-drawOffset.x, drawOffset.y),
  new SAT.Vector(-drawOffset.x, -drawOffset.y),
  new SAT.Vector(drawOffset.x, -drawOffset.y),
  new SAT.Vector(drawOffset.x, drawOffset.y)]
);

console.log(square.calcPoints);

// working sample calc points, reordered to be counter clockwise
// var square = new SAT.Polygon(new SAT.Vector(364, 251), [
//   new SAT.Vector(-18, 2),
//   new SAT.Vector(-2, -18),
//   new SAT.Vector(18, -2),
//   new SAT.Vector(2, 18)
// ]);

// sample calc points from test map
// var square = new SAT.Polygon(new SAT.Vector(364, 251), [
//   new SAT.Vector(2, 18),
//   new SAT.Vector(18, -2),
//   new SAT.Vector(-2, -18),
//   new SAT.Vector(-18, 2)
// ]);

var circle = new SAT.Circle(new SAT.Vector(377, 247), 8);

var response = new SAT.Response();
var collided = SAT.testPolygonCircle(square, circle, response);

console.log(collided);
console.log(response);