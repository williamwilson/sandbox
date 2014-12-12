var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra'));

var files = [
  'js/app.js',
  'js/augment.js',
  'js/unit.js',
  'js/vendor',
  'images',
  'css/app.css'
];

function bundle() {
  return fs.removeAsync(__dirname + '/../public/tmp/')
  .then(function() {
    var copies = [];
    for(var i = 0; i < files.length; i++) {
      var copy = fs.copyAsync(__dirname + '/../public/' + files[i], __dirname + '/../public/tmp/' + files[i]);
      copies.push(copy);
    }
    return Promise.all(copies);
  });
}
exports.bundle = bundle;