var gulp = require('gulp'),
  spawn = require('child_process').spawn,
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  jasmine = require('gulp-jasmine');

var node;
var client = ['./public/css/*.*', './public/js/*.*', './pb-shooter/client.js', './pb-shooter/*.js'];
var server = ['./app.js', './pb-shooter/*.js'];
var tests = ['./pb-shooter/tests/*.js'];
var test = server.concat(tests);

gulp.task('server', function() {
  if (node) node.kill();
  node = spawn('node', ['app.js'], {stdio: 'inherit'});
  node.on('close', function(code) {
    if (code === 8) {
      console.log('Error detected, waiting for changes...');
    }
  });
});

gulp.task('pipeline', function() {
  gulp.src('./public/*.*').pipe(gulp.dest('./public/tmp/css'));
  gulp.src('./public/js/*.*').pipe(gulp.dest('./public/tmp/js'));
  gulp.src('./public/js/vendor/*.*').pipe(gulp.dest('./public/tmp/js/vendor'));
  gulp.src('./public/css/*.*').pipe(gulp.dest('./public/tmp/css'));
  gulp.src('./pb-shooter/client.js').pipe(gulp.dest('./public/tmp/js/pb-shooter'));
});

gulp.task('browserify', function() {
  return browserify('./pb-shooter/game.js', { detectGlobals: false })
    .require('./pb-shooter/game.js', { expose: 'Game' })
    .require('./pb-shooter/gameState.js', { expose: 'GameState' })
    .require('./pb-shooter/d3Utils.js', { expose: 'd3Utils' })
    .bundle()
    .pipe(source('game.js'))
    .pipe(gulp.dest('./public/tmp/js/'));
});

gulp.task('t', ['test'], function() { 
  gulp.watch(test, ['test'])
});

gulp.task('test', function() {  
  return gulp.src(tests)
    .pipe(jasmine({includeStackTrace: true}))
    .on('error', function(e) { });
});

gulp.task('default', ['test', 'server', 'pipeline', 'browserify'], function() {
  gulp.watch(client, ['pipeline', 'browserify']);
  gulp.watch(server, ['server']);
  gulp.watch(test, ['test']);
});

process.on('exit', function() {
  if (node) node.kill();
});