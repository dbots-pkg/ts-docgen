"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = __importDefault(require("./config"));
var typedoc_1 = require("typedoc");
var tmp_1 = __importDefault(require("tmp"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var util_1 = __importDefault(require("util"));
var documentation_1 = require("./documentation");
var zlib_1 = require("zlib");
var readFile = util_1.default.promisify(fs_1.default.readFile);
var mainPromises = [];
console.log('Parsing using TypeDoc...');
var files = [];
for (var _i = 0, _a = config_1.default.source; _i < _a.length; _i++) {
    var dir = _a[_i];
    files.push(dir + "/*.ts", dir + "/**/*.ts");
}
mainPromises[0] = new Promise(function (res, rej) {
    var app = new typedoc_1.Application(), tempDir = tmp_1.default.dirSync(), filePath = path_1.default.join(tempDir.name, 'project-reflection.json');
    var writeResult = app.generateJson(files, filePath);
    if (!writeResult)
        rej('Couldn\'t write temp file.');
    else {
        var data = require(filePath);
        if (typeof data == 'object')
            res(data);
        else
            rej('Couldn\'t access temp file.');
    }
});
if (config_1.default.custom) {
    console.log('Loading custom docs files...');
    var customDir_1 = path_1.default.dirname(config_1.default.custom);
    // Figure out what type of definitions file we're loading
    var type_1;
    var defExtension = path_1.default.extname(config_1.default.custom).toLowerCase();
    if (defExtension === '.json')
        type_1 = 'json';
    else if (defExtension === '.yml' || defExtension === '.yaml')
        type_1 = 'yaml';
    else
        throw new TypeError('Unknown custom docs definition file type.');
    mainPromises[1] = readFile(config_1.default.custom, 'utf-8').then(function (defContent) {
        // Parse the definition file
        var definitions;
        if (type_1 === 'json')
            definitions = JSON.parse(defContent);
        else
            definitions = require('js-yaml').safeLoad(defContent);
        var custom = {};
        var filePromises = [];
        var _loop_1 = function (cat) {
            // Add the category to the custom docs
            var catID = cat.id || cat.name.toLowerCase();
            var dir = path_1.default.join(customDir_1, cat.path || catID);
            var category = {
                name: cat.name || cat.id,
                files: {}
            };
            custom[catID] = category;
            var _loop_2 = function (file) {
                var fileRootPath = path_1.default.join(dir, file.path);
                var extension = path_1.default.extname(file.path);
                var fileID = file.id || path_1.default.basename(file.path, extension);
                category.files[fileID] = null;
                filePromises.push(readFile(fileRootPath, 'utf-8').then(function (content) {
                    category.files[fileID] = {
                        name: file.name,
                        type: extension.toLowerCase().replace(/^\./, ''),
                        content: content,
                        path: path_1.default.relative(config_1.default.root, fileRootPath).replace(/\\/g, '/')
                    };
                    if (config_1.default.verbose)
                        console.log("Loaded custom docs file " + catID + "/" + fileID);
                }));
            };
            // Add every file in the category
            for (var _i = 0, _a = cat.files; _i < _a.length; _i++) {
                var file = _a[_i];
                _loop_2(file);
            }
        };
        for (var _i = 0, definitions_1 = definitions; _i < definitions_1.length; _i++) {
            var cat = definitions_1[_i];
            _loop_1(cat);
        }
        return Promise.all(filePromises).then(function () {
            var fileCount = Object.keys(custom).map(function (k) { return Object.keys(custom[k]); }).reduce(function (prev, c) { return prev + c.length; }, 0);
            var categoryCount = Object.keys(custom).length;
            console.log(fileCount + " custom docs file" + (fileCount !== 1 ? 's' : '') + " in " +
                (categoryCount + " categor" + (categoryCount !== 1 ? 'ies' : 'y') + " loaded."));
            return custom;
        });
    });
}
Promise.all(mainPromises).then(function (results) {
    var _a = results, data = _a[0], custom = _a[1];
    console.log("Serializing documentation with format version " + documentation_1.FORMAT_VERSION + "...");
    var docs = documentation_1.generateDocs(data);
    var output = JSON.stringify(documentation_1.generateFinalOutput(docs, custom), null, config_1.default.spaces);
    if (config_1.default.compress) {
        console.log('Compressing...');
        output = zlib_1.deflateSync(output).toString('utf8');
    }
    if (config_1.default.output) {
        console.log("Writing to " + config_1.default.output + "...");
        fs_1.default.writeFileSync(config_1.default.output, output);
    }
    console.log('Done!');
    process.exit(0);
}).catch(function (err) {
    console.error(err);
    process.exit(1);
});
