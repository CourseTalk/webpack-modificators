'use strict';

var path = require('path'),
    WebpackModificators = require('../index.js');

var DIST = path.join(__dirname, '../dist_example'),
    SRC = path.join(__dirname, './src');

var config = [{
    entry: {
        entry: path.join(SRC, 'main.js')
    },
    output: {
        path: DIST,
        filename: '[name]-bundle.js'
    }
}, {
    entry: {
        'new-entry': path.join(SRC, 'main.js')
    },
    output: {
        path: DIST,
        filename: '[name]-bundle.js'
    },
    plugins: [new WebpackModificators({strong: ['new']})]
}];

module.exports = config;
