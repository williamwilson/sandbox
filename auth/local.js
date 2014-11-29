var LocalStrategy = require('passport-local').Strategy,
    Users = require('../db/users.js');

module.exports = new LocalStrategy(
  function(username, password, done) {
    Users.findByUsername(username).then(function(user) {
      if (!user)
        return done(null, false, { message: 'Incorrect username.' });
      
      return user.validPassword(password)
        .then(function(result) {
          if (!result)
            return done(null, false, { message: 'Incorrect password.' });
            
          return done(null, user);
        });
    });
});