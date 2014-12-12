var neo4j = require('./neo4j/neo4j.js'),
    Promise =require('bluebird'),
    Users = require('./db/users.js');

neo4j.deleteAll().then(function() {
  return Promise.props({
    top: neo4j.saveNode({name: 'Full Guard (Top)'}),
    bottom: neo4j.saveNode({name: 'Full Guard (Bottom)'})
  });
})
.then(function(nodes) {
  return { 
    top: nodes.top._data.data, 
    bottom: nodes.bottom._data.data,
  }
})
.then(function(nodes) {
  return neo4j.relateNodes(nodes.top, nodes.bottom, { name: 'Shoop Sweep' });
})
.then(function(result) {
  console.log('results');
  console.log(result);
});

// d3 code for the d attr on a path to generate an elliptical curve
// .attr("d", function(d) {
//   var dx = d.target.x - d.source.x,
//     dy = d.target.y - d.source.y,
//     dr = Math.sqrt(dx * dx + dy * dy);
//   return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
// });