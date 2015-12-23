'use strict';

var path = require("path"),
    fs = require('fs');

function WebpackModificators(modificator) {
    this.modificator = modificator;
}

WebpackModificators.prototype.apply = function (compiler) {
    var modificator = this.modificator;
    compiler.plugin('normal-module-factory', function (cmf) {
        cmf.plugin("before-resolve", function (result, callback) {
            if (!result) {
                return callback();
            }
            if (checkFileWithModificator(modificator, result.context, result.request)) {
                result.request = fileWithModificator(modificator, result.request);
            }
            return callback(null, result);
        });
        cmf.plugin("after-resolve", function (result, callback) {
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

function fileWithModificator (modificator, fieName) {
    var fileInfo = path.parse(fieName);
    fileInfo.name = fileInfo.name + '--' + modificator;
    fileInfo.base = fileInfo.name + fileInfo.ext;
    return path.format(fileInfo);
}

function normalizeFilePatch (source, file) {
    return path.normalize(path.join(source, file));
}

function checkFileWithModificator (modificator, source, file) {
    return _checkFileWithModificator(modificator, source, file) ||
           _checkFileWithModificator(modificator, source, file + '.js') ||
           _checkFileWithModificator(modificator, source, path.join(file, 'index.js'));
}

function _checkFileWithModificator (modificator, source, file) {
    var fileName = normalizeFilePatch(source, file);
    var fileNameWithModificator = fileWithModificator(modificator, fileName);
    return fs.existsSync(fileNameWithModificator);
}

module.exports = WebpackModificators;
