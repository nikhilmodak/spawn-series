'use strict'

var spawn = require('child_process').spawn;

module.exports = function (commands, options, finish, foreach) {
  if (!(commands instanceof Array)) {
    throw new Error('First argument should be an array.');
  }
  if (typeof options === 'function') {
    foreach = finish;
    finish = options;
    options = {};
  }

  var stdouts = [];
  var stderrs = [];
  function start(i) {
    if (i < commands.length) {
      if (!commands[i].when || commands[i].when(i, commands[i])) {
        var child = spawn(commands[i].command, commands[i].args, options);
        if (foreach) {
          foreach(child, i, commands[i]);
        }
        child.on('close', function (code) {
          if (code === 0) {
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