var GameState = require('./gameState.js'),
    augment = require('augment');

var Game = augment(Object, function() {
  this.constructor = function() {
    this.time = 0;
    this.state = new GameState();
    this.states = [this.state];
    
    this.delay = 5;
  };
  this.tick = function() {
    this.time += 1;
    this.state = this.state.tick();
    this.states[this.time] = this.state;
    this.clientState = this.states[this.time - this.delay];
  };
  this.sync = function(syncState) {
    if (!(syncState instanceof GameState))
      syncState = new GameState(syncState);

    this.state = syncState;
    this.states = this.states.slice(0, syncState.time);
    this.states.push(syncState);

    if (syncState.time > this.time) {
      this.time = syncState.time;
      return;
    }

    while(this.state.time < this.time) {
      this.state = this.state.tick();
      this.states.push(this.state);
    }
  }
});

module.exports = Game;