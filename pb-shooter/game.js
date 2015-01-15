var GameState = require('./gameState.js'),
    augment = require('augment');

var Game = augment(Object, function() {
  this.constructor = function() {
    this.time = 0;
    this.state = new GameState();
    this.states = [this.state];
    this.players = {};
    
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
  };
  this.addPlayer = function(player) {
    this.players[player.id] = player;
    player.position = { x: 100, y: 100 };
    this.state.addPlayer(player);
  };
  this.updatePlayer = function(player) {
    if (!this.players[player.id])
      return;

    this.players[player.id] = player;
    this.state.updatePlayer(player);
  };
  this.playerClick = function(id, position) {
    if (!this.players[id]) {
      this.addPlayer({id: id, position: position});
    }
  }
});

module.exports = Game;