'use strict';

var path = require("path"),
    fs = require('fs'),
    R = require('ramda'),
    Maybe = require('ramda-fantasy').Maybe;

var SEPORATOR = '--';
/**
 * WebpackModificators Plugin constructor
 * @param {object} data - Widget settings
 * @constructor
 */
function WebpackModificators(data) {
    data = data || {};
    this.week_modificators = data.week || [];
    this.strong_modificators = data.strong || [];
    this.used_modificators = [];
}

/**
 * Apply plugin
 * @param compiler
 */
WebpackModificators.prototype.apply = function (compiler) {
    var _this = this;
    compiler.plugin('normal-module-factory', function (nmf) {
        nmf.plugin("before-resolve", function (result, callback) {
            if (!result) {
                return callback();
            }
            result.request = _this.lookupModificators(result.context, result.request);
            return callback(null, result);
        });
        nmf.plugin("after-resolve", function (result, callback) {
            if (!result){
                return callback();
            }
            result.resource = _this.lookupModificators(result.context, result.resource);
            return callback(null, result);
        });
    });
};

/**
 * Find file with modificators
 * @param {string} source - base file patch
 * @param {string} file - file name
 * @returns {string}
 */
WebpackModificators.prototype.lookupModificators = function (source, file) {
    var checModificator = function (modificator) {
        var result = null;
        if (checkFileWithModificator(modificator, source, file)) {
            this.used_modificators.push(modificator);
            result = fileWithModificator(modificator, file);
        }
        return Maybe(result)
    }.bind(this);
    var modificators = R.concat(this.strong_modificators, this.week_modificators);
    for (var n = modificators.length; n >= 1; n--) {
        var combModificators = R.map(R.join(SEPORATOR), combsWithRep(n, modificators));
        var checks = R.filter(Maybe.isJust, R.map(checModificator, combModificators));
        var files = R.map(function (m) {return m.getOrElse(file)}, checks);
        if (files.length > 1) {
            throw Error("File conflict: " + files);
        }
        if (files.length == 1) {
            return files[0];
        }
    }
    return file
};

/**
 * Get combinations with replacment
 * @param {int} n - size of each chunk
 * @param {Array} list - list of elements
 * @returns {Array}
 */
var combsWithRep = R.curry(function (n, list) {
    if (n == 0) {
        return [[]];
    } else if (list.length == 0) {
        return [];
    } else {
        var tails = combsWithRep(n - 1, list);
        var concatAll = R.map(R.concat(R.__, R.__), R.map(R.of, list));
        return R.ap(concatAll, tails);
    }
});

/**
 * Get file name with modificator (version for node 0.10)
 * @param {string} modificator - modificator name
 * @param {string} fieName - file name
 * @returns {string} - file with modificator
 */
function fileWithModificator_node10 (modificator, fieName) {
    var fileData = fieName.split('.');
    var index = fileData.length - 2;
    if (index < 0) {
        index = 0;
    }
    if (!fileData[index]) {
        index = fileData.length - 1;
    }
    fileData[index] = fileData[index] + SEPORATOR + modificator;
    return fileData.join('.');
}

/**
 * Get file name with modificator
 * @param {string} modificator - modificator name
 * @param {string} fieName - file name
 * @returns {string} - file with modificator
 */
function fileWithModificator (modificator, fieName) {
    if (!path.hasOwnProperty('parse')) {
        return fileWithModificator_node10(modificator, fieName);
    }
    var fileInfo = path.parse(fieName);
    fileInfo.name = fileInfo.name + SEPORATOR + modificator;
    fileInfo.base = fileInfo.name + fileInfo.ext;
    return path.format(fileInfo);
}

/**
 * Normalize file patch for base directory
 * @param {string} source - file base directory
 * @param {string} file - file name
 * @returns {string}
 */
function normalizeFilePatch (source, file) {
    return path.normalize(path.join(source, file));
}

/**
 * Check if file with modificator exist (also check folder)
 * @param {string} modificator - modificator name
 * @param {string} source - file base directory
 * @param {string} file - file name
 * @returns {boolean}
 */
function checkFileWithModificator (modificator, source, file) {
    return _checkFileWithModificator(modificator, source, file) ||
           _checkFileWithModificator(modificator, source, file + '.js') ||
           _checkFileWithModificator(modificator, source, path.join(file, 'index.js'));
}

/**
 * Check if file with modificator exist
 * @param {string} modificator - modificator name
 * @param {string} source - file base directory
 * @param {string} file - file name
 * @returns {boolean}
 */
function _checkFileWithModificator (modificator, source, file) {
    var fileName = normalizeFilePatch(source, file);
    var fileNameWithModificator = fileWithModificator(modificator, fileName);
    return fs.existsSync(fileNameWithModificator);
}

module.exports = WebpackModificators;
