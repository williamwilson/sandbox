var gulp = require('gulp'),
  spawn = require('child_process').spawn,
  browserify = require('browserify'),
  source = require('vinyl-source-stream');

var node;
var client = ['./public/css/*.*', './public/js/*.*', './pb-shooter/*.js'];
var server = ['./app.js'];

gulp.task('server', function() {
  if (node) node.kill();
  node = spawn('node', ['app.js'], {stdio: 'inherit'});
  node.on('close', function(code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
});

gulp.task('pipeline', function() {
  gulp.src('./public/*.*').pipe(gulp.dest('./public/tmp/css'));
  gulp.src('./public/js/*.*').pipe(gulp.dest('./public/tmp/js'));
  gulp.src('./public/js/vendor/*.*').pipe(gulp.dest('./public/tmp/js/vendor'));
  gulp.src('./public/css/*.*').pipe(gulp.dest('./public/tmp/css'));
});

gulp.task('browserify', function() {
  return browserify('./pb-shooter/game.js').bundle()
    .pipe(source('game.js'))
    .pipe(gulp.dest('./public/tmp/js/'));
});

gulp.task('default', ['server', 'pipeline', 'browserify'], function() {
  gulp.watch(client, ['pipeline', 'browserify']);
  gulp.watch(server, ['server']);
});

process.on('exit', function() {
  if (node) node.kill();
});