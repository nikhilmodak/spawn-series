'use strict'

var spawn = require('cross-spawn').spawn;

module.exports = function (commands, finish, foreach) {
  if (!(commands instanceof Array)) {
    throw new Error('First argument should be an array.');
  }
  var stdouts = [];
  var stderrs = [];
  function start(i) {
    if (i < commands.length) {
      if (!commands[i].when || commands[i].when(i, commands[i])) {
        var child = spawn(commands[i].command, commands[i].args, commands[i].options);
        if (foreach) {
          foreach(child, i, commands[i]);
        }
        child.on('close', function (code) {
          if (code === 0 || commands[i].options.ignoreError) {
            start(i + 1);
          } else {
            if (finish) {
              finish(code, i, commands[i]);
            }
          }
        });
      } else {
        //skip if condition is not stisfied
        start(i + 1);
      }
    } else {
      if (finish) {
        finish(0);
      }
    }
  }
  start(0);
}