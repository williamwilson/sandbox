(function(window) {
  var Game = require('Game');
  var GameState = require('GameState');
  var d3Utils = require('d3Utils');

  GameState.spawnBug = function() { }

  var io = window.io.connect(window.location.origin, { transports: ['websocket']});

  var game = new Game();
  window.game = game;

  var field = d3.select('#screen').append('svg');
  var latestServerState, lastSyncedState, thisPlayerId, lastSentInputs;
  var lastRenderedTime = 0;

  var inputs = { mouse: { } };

  $('svg').mousedown(function(e) {
    inputs.mouse.leftDown = true;
    return true;
  });

  $('svg').mouseup(function(e) {
    inputs.mouse.leftDown = false;
    return true;
  });

  $('svg').mousemove(function(e) {
    var posX = e.pageX - $(this).position().left,
        posY = e.pageY - $(this).position().top;

    inputs.mouse.x = posX;
    inputs.mouse.y = posY;
  });

  io.on('tick', function(gameState, playerId) {
    thisPlayerId = playerId;

    if (!latestServerState)
      latestServerState = gameState;

    if (gameState.time > latestServerState.time) {
      newServerState = true;
      latestServerState = gameState;
    }
  });

  $('svg').click(function(e) {
    var posX = e.pageX - $(this).position().left,
        posY = e.pageY - $(this).position().top;
    io.emit('click', {x: posX, y: posY});
  });

  window.setInterval(function() {
    if (lastSyncedState == latestServerState)
      return;

    game.sync(latestServerState);
    lastSyncedState = latestServerState;
    game.updatePlayer({ id: thisPlayerId, inputs: inputs });
    game.tick();
    sendInputs();
  }, 16);
  
  function sendInputs() {
    if (lastSentInputs && 
       inputs.mouse.x == lastSentInputs.mouse.x && 
       inputs.mouse.y == lastSentInputs.mouse.y &&
       inputs.mouse.leftDown == lastSentInputs.mouse.leftDown)
      return;

    io.emit('inputs', { time: game.time, inputs: inputs });
    lastSentInputs = {
      mouse: {
        x: inputs.mouse.x,
        y: inputs.mouse.y,
        leftDown: inputs.mouse.leftDown
      }
    };
  }

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
    updatePlayers(gameState.players);
    updateLasers(gameState.lasers);
  }

  function updateLasers(lasers) {
    field.selectAll('rect.laser').remove();
    var laserSprites = field.selectAll('rect.laser').data(lasers);
    laserSprites.enter().append('rect');

    laserSprites
      .attr('class', 'laser')
      .attr('fill', 'black')
      .attr('height', 2)
      .attr('width', 12)
      .attr('transform', function(d) { return d3Utils.buildTransformString(d); });
  }

  function updatePlayers(players) {
    field.selectAll('image.player').remove();
    var playerSprites = field.selectAll('image.player').data(players);
    playerSprites.enter().append('image');

    playerSprites
      .attr('class', 'player')
      .attr('xlink:href', 'images/babyjoel.png')
      .attr('height', 25)
      .attr('width', 25)
      .attr('transform', function(d) { return d3Utils.buildTransformString(d); });
  }

  function updateJoin() {
    var join = { position: { x: 100, y: 100 } };
    field.selectAll('circle.join').remove();
    var joinSprite = field.selectAll('circle.join').data([join]);
    joinSprite.enter().append('circle');

    joinSprite
      .attr('class', 'join')
      .attr('r', 10)
      .attr('fill', 'green')
      .attr('transform', function(d) { return d3Utils.buildTransformString(d); });
  }
  updateJoin();

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