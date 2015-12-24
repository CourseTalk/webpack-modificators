#!/usr/bin/env node

"use strict";

var sys = require('sys'),
    exec = require('child_process').exec,
    version = require('./package.json').version;

exec("git tag -a " + version +" -m 'version " + version + "'", function (error, stdout, stderr) {
  sys.print('stdout: ' + stdout);
  sys.print('stderr: ' + stderr);
  if (error !== null) {
    console.log('exec error: ' + error);
  } else {
      exec("git push --tags", function (error, stdout, stderr) {
          sys.print('stdout: ' + stdout);
          sys.print('stderr: ' + stderr);
          if (error !== null) {
              console.log('exec error: ' + error);
          } else {
              exec("npm publish", function (error, stdout, stderr) {
                  sys.print('stdout: ' + stdout);
                  sys.print('stderr: ' + stderr);
                  if (error !== null) {
                      console.log('exec error: ' + error);
                  }
              });
          }
      });
  }
});
