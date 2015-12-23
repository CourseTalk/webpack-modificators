'use strict';

var path = require('path'),
    fs = require('fs'),
    rimraf = require('rimraf'),
    webpack = require('webpack'),
    WebpackModificators = require('../index.js');

var OUTPUT_DIR = path.join(__dirname, '../dist'),
    FIXTURES = path.join(__dirname, './fixtures');

describe('WebpackModificators', function () {

    beforeEach(function(done) {
        rimraf(OUTPUT_DIR, done);
    });

    it('Compile without plugin', function (done) {
        buildWebpack({
            entry: {
                entry: path.join(FIXTURES, 'entry.js')
            },
            output: {
                path: OUTPUT_DIR,
                filename: '[name]-bundle.js'
            }
        }, function (err, stats) {
            expect(err).toBeFalsy();
            expect(stats.compilation.errors).toEqual([]);
            expect(stats.compilation.warnings).toEqual([]);
            var outputFile = path.join(OUTPUT_DIR, 'entry-bundle.js');
            expect(fs.existsSync(outputFile)).toBeTruthy();
            done();
        });
    });

    it('Compile with plugin', function (done) {
        buildWebpack({
            entry: {
                entry: path.join(FIXTURES, 'entry.js')
            },
            output: {
                path: OUTPUT_DIR,
                filename: '[name]-bundle.js'
            },
            plugins: [new WebpackModificators()]
        }, function (err, stats) {
            expect(err).toBeFalsy();
            expect(stats.compilation.errors).toEqual([]);
            expect(stats.compilation.warnings).toEqual([]);
            var outputFile = path.join(OUTPUT_DIR, 'entry-bundle.js');
            expect(fs.existsSync(outputFile)).toBeTruthy();
            var fileContent = fs.readFileSync(outputFile).toString();
            expect(fileContent).toContain('____dependency.js___');
            done();
        });
    });

    it('Replate entry file with modificator', function (done) {
        buildWebpack({
            entry: {
                entry: path.join(FIXTURES, 'entry.js')
            },
            output: {
                path: OUTPUT_DIR,
                filename: '[name]-bundle.js'
            },
            plugins: [new WebpackModificators('v2')]
        }, function (err, stats) {
            expect(err).toBeFalsy();
            expect(stats.compilation.errors).toEqual([]);
            expect(stats.compilation.warnings).toEqual([]);
            var outputFile = path.join(OUTPUT_DIR, 'entry-bundle.js');
            expect(fs.existsSync(outputFile)).toBeTruthy();
            var fileContent = fs.readFileSync(outputFile).toString();
            expect(fileContent).toContain('____dependency--v2.js___');
            done();
        });
    });
});

function buildWebpack(webpackConfig, callback) {
    webpack(webpackConfig, callback);
}
