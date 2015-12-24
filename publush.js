#!/usr/bin/env node

var sys = require('sys'),
    exec = require('child_process').exec,
    version = require('./package.json').version;

function puts(error, stdout, stderr) {
    if (error) {
        throw new Error(error);
    }
    if (stderr) {
        throw new Error(error);
    }
    sys.puts(stdout);
}
exec("git tag -a " + version +" -m 'version " + version + "'", puts);
exec("git push --tags", puts);
exec("npm publish", puts);
