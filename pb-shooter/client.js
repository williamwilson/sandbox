(function(window) {
  var Game = require('Game');
  var GameState = require('GameState');

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
    var origin = {
      x: 400,
      y: 250,
      rotateX: 0,
      rotateY: 0
    };
    field.selectAll('circle.origin').remove();
    var originSprite = field.selectAll('circle.origin').data([origin]);
    originSprite.enter().append('circle');

    originSprite
      .attr('class', 'origin')
      .attr('r', 20)
      .attr('transform', function(d) { return buildTransformString(d.x, d.y, 0, d.rotateX, d.rotateY); });
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
      .attr('transform', function(d) { return buildTransformString(d.position.x - d.drawOffset.x, d.position.y - d.drawOffset.y, d.angle, d.drawOffset.x, d.drawOffset.y); });
  }

  function buildTransformString(x, y, angle, rotateX, rotateY) {
    return "translate( " + x + "," + y + ") rotate(" + angle + " " + rotateX + " " + rotateY + ")";
  }
})(window);