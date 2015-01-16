var EventEmitter = require('events').EventEmitter,
    moment = require('moment');

var bus = new EventEmitter();
bus.setMaxListeners(500);

bus.log = function(message) {
  var message = moment().format('h:mm:ss:SS') + ': ' + message;
  bus.emit('log', message);
}

module.exports = bus;