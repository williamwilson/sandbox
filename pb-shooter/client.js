(function(window) {
  var Game = require('Game');
  var GameState = require('GameState');
  var d3Utils = require('d3Utils');

  GameState.spawnBug = function() { }

  var io = window.io.connect(window.location.origin, { transports: ['websocket']});

  var game = new Game();
  window.game = game;

  var field = d3.select('#screen').append('svg');
  var latestServerState, lastSyncedState;
  var lastRenderedTime = 0;

  io.on('tick', function(gameState) {
    if (!latestServerState)
      latestServerState = gameState;

    if (gameState.time > latestServerState.time) {
      newServerState = true;
      latestServerState = gameState;
    }
  });

  window.setInterval(function() {
    if (lastSyncedState == latestServerState)
      return;

    game.sync(latestServerState);
    lastSyncedState = latestServerState;
    game.tick();
  }, 16);
  
  function frame() {        
    if (game.state.time >= lastRenderedTime) {
      lastRenderedTime = game.state.time;
      render(game.state);
    }
    
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function render(gameState) {
    if (!gameState)
      return;
      
    updateBugs(gameState.bugs);
  }

  function updateOrigin() {
    var origin = { position: { x: 400, y: 250 } };

    field.selectAll('circle.origin').remove();
    var originSprite = field.selectAll('circle.origin').data([origin]);
    originSprite.enter().append('circle');

    originSprite
      .attr('class', 'origin')
      .attr('r', 20)
      .attr('transform', function(d) { return d3Utils.buildTransformString(d); });
  }
  updateOrigin();

  function updateBugs(bugs) {
    field.selectAll('image.bug').remove();
    var bugSprites = field.selectAll('image.bug').data(bugs);
    bugSprites.enter()
      .append('image');
    
    bugSprites
      .attr('class', 'bug')
      .attr('xlink:href', 'images/bug.png')
      .attr('height', 25)
      .attr('width', 25)
      .attr('transform', function(d) { return d3Utils.buildTransformString(d); });
  }
})(window);