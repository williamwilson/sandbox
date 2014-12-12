var neo4j = require('neo4j'),
    db = new neo4j.GraphDatabase('http://localhost:7474'),
    Promise = require('bluebird');

function deleteAll() {
  var query = [
  'MATCH (n)',
  'OPTIONAL MATCH (n)-[r]-()',
  'DELETE n,r'].join('\n');
  var params = {};
  
  return new Promise(function(resolve, reject) {
    db.query(query, params, function (e, results) {
      if (e) return reject(e);
      resolve(results);
    });
  });
}
exports.deleteAll = deleteAll;

function saveNode(data) {
  var node = db.createNode(data);
  return new Promise(function(resolve, reject) {
    node.save(function(e, node) {
      if (e) return reject(e);
      resolve(node);
    });
  });
}
exports.saveNode = saveNode;

function selectAll() {
  var query = 'MATCH (n) RETURN n;'
  var params = {};
  
  return new Promise(function(resolve, reject) {
    db.query(query, params, function (e, results) {
      if (e) return reject(e);
      var mapped = [];
      for(var i = 0; i < results.length; i++) {
        mapped[i] = results[i]['n']._data.data;
      }
      
      resolve(mapped);
    });
  });
}
exports.selectAll = selectAll;

function findByUsername(username) {
  var query = 'MATCH (user) WHERE user.username = {username} RETURN user';
  var params = {username: username};
  
  return new Promise(function(resolve, reject) {
    db.query(query, params, function (e, results) {
      if (e) return reject(e);
      resolve(results);
    });
  });
}
exports.findByUsername = findByUsername;