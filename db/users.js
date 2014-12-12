var Promise = require('bluebird'),
    bcrypt = require('bcrypt');
    
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : '127.0.0.1',
    user     : 'joelhoward0',
    database : 'sandbox'
  }
});

function serialize(user, done) { 
  done(null, user.id); 
}
exports.serialize = serialize;

function deserialize(id, done) {
  findById(id).then(function (user) {
    done(null, user);
  });
};
exports.deserialize = deserialize;

function fromNode(result) {
  return {
    username: result._data.data.username
  };
};
exports.fromNode = fromNode;

function inflateUser(user) {
  if (typeof user !== 'object')
    return null;
  
  user.validPassword = function(password) {
    return new Promise(function(resolve, reject) {
      return bcrypt.compare(password, user.password_hash, function(e, res) {
        if (e) return reject(e);
        resolve(res);
      });
    });
  }
  
  return user;
}

function findById(id) {
  return knex.select('*').from('user').where('id', id)
  .then(function(result) { return inflateUser(result[0]); });
}
exports.findById = findById;

function findByUsername(username) {
  return knex.select('*').from('user').where('username', username)
  .then(function(result) { return inflateUser(result[0]); });
}
exports.findByUsername = findByUsername;

function register(username, password) {
  return findByUsername(username)
  .then(function(user) {
    if (!!user)
      return { success: false, reason: "Username already exists", username: username };
    
    return saltPassword(password)
    .then(function(hash) {
      return knex.insert({username: username, password_hash: hash}).into('user');
    })
    .then(function(id) {
      return Promise.props({ 
        success: true, 
        user: findById(id)
      });
    });
  });
}
exports.register = register;

function saltPassword(password) {
  return new Promise(function(resolve, reject) {
    bcrypt.genSalt(10, function(e, salt) {
      if (e) return reject(e);
      bcrypt.hash(password, salt, function(e, hash) {
        if (e) return reject(e);
        resolve(hash);
      });
    });
  });
}