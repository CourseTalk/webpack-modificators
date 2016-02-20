'use strict';

var path = require("path"),
    fs = require('fs');

/**
 * WebpackModificators Plugin constructor
 * @param {object} data - Widget settings
 * @constructor
 */
function WebpackModificators(data) {
    this.week_modificators = data.week || [];
    this.strong_modificators = data.strong || [];
    this.used_modificators = [];
}

/**
 * Apply plugin
 * @param compiler
 */
WebpackModificators.prototype.apply = function (compiler) {
    var modificator = this.modificator;
    compiler.plugin('normal-module-factory', function (nmf) {
        nmf.plugin("before-resolve", function (result, callback) {
            if (!result) {
                return callback();
            }
            if (checkFileWithModificator(modificator, result.context, result.request)) {
                result.request = fileWithModificator(modificator, result.request);
            }
            return callback(null, result);
        });
        nmf.plugin("after-resolve", function (result, callback) {
            if (!result){
                return callback();
            }
            if (checkFileWithModificator(modificator, result.context, result.resource)) {
                result.resource = fileWithModificator(modificator, result.resource);
            }
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
WebpackModificators.prototype.lookup_modificators = function lookup_modificators(source, file) {
    for (var strong_key in this.strong_modificators) {
        if (this.strong_modificators.hasOwnProperty(strong_key)) {
            var strong_modificator = this.strong_modificators[strong_key];
            if (checkFileWithModificator(strong_modificator, source, file)) {
                this.used_modificators.push(strong_modificator);
                return fileWithModificator(strong_modificator, file);
            }
        }
    }

    for (var weak_key in this.week_modificators) {
        if (this.week_modificators.hasOwnProperty(weak_key)) {
            var week_modificator = this.week_modificators[weak_key];
        }
    }
};

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
    fileData[index] = fileData[index] + '--' + modificator;
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
    fileInfo.name = fileInfo.name + '--' + modificator;
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
