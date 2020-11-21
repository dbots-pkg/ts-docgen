"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runGenerator = void 0;
var TypeDoc = __importStar(require("typedoc"));
var tmp_1 = __importDefault(require("tmp"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var util_1 = __importDefault(require("util"));
var documentation_1 = require("./documentation");
var typescript_1 = require("typescript");
var readFile = util_1.default.promisify(fs_1.default.readFile);
function runGenerator(config) {
    config = parseConfig(config);
    var mainPromises = [];
    if (config.existingOutput) {
        console.log('Parsing using existing output file...');
        mainPromises[0] = readFile(config.existingOutput, 'utf-8').then(JSON.parse);
    }
    else if (config.source) {
        console.log('Parsing using TypeDoc...');
        var files_1 = ['C:/GitHub/dbots.js/src/index.ts'];
        // for (const dir of config.source) files.push(`${dir}/*/*.ts`, `${dir}/**/*.ts*/`)
        mainPromises[0] = new Promise(function (res, rej) {
            var app = new TypeDoc.Application(), tempDir = tmp_1.default.dirSync(), filePath = path_1.default.join(tempDir.name, 'project-reflection.json');
            // If you want TypeDoc to load tsconfig.json / typedoc.json files
            app.options.addReader(new TypeDoc.TSConfigReader());
            app.options.addReader(new TypeDoc.TypeDocReader());
            app.bootstrap({
                mode: 'modules',
                logger: 'none',
                target: typescript_1.ScriptTarget.ES5,
                module: typescript_1.ModuleKind.CommonJS,
                experimentalDecorators: true
            });
            var project = app.convert(app.expandInputFiles(['src']));
            var writeResult = project && app.generateJson(files_1, filePath);
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
    }
    if (config.custom) {
        console.log('Loading custom docs files...');
        var customDir_1 = path_1.default.dirname(config.custom);
        // Figure out what type of definitions file we're loading
        var type_1;
        var defExtension = path_1.default.extname(config.custom).toLowerCase();
        if (defExtension === '.json')
            type_1 = 'json';
        else if (defExtension === '.yml' || defExtension === '.yaml')
            type_1 = 'yaml';
        else
            throw new TypeError('Unknown custom docs definition file type.');
        mainPromises[1] = readFile(config.custom, 'utf-8').then(function (defContent) {
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
                            path: path_1.default.relative(config.root || '.', fileRootPath).replace(/\\/g, '/')
                        };
                        if (config.verbose)
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
        var output = JSON.stringify(documentation_1.generateFinalOutput(docs, custom), null, config.spaces);
        if (config.output) {
            console.log("Writing to " + config.output + "...");
            fs_1.default.writeFileSync(config.output, output);
        }
        console.log('Done!');
        process.exit(0);
    }).catch(function (err) {
        console.error(err);
        process.exit(1);
    });
}
exports.runGenerator = runGenerator;
function parseConfig(config) {
    if (config.source)
        config.source = config.source.map(path_1.default.normalize);
    if (config.existingOutput)
        config.existingOutput = path_1.default.normalize(config.existingOutput);
    if (config.custom)
        config.custom = path_1.default.normalize(config.custom);
    config.root = path_1.default.normalize(config.root || '.');
    if (config.output)
        config.output = path_1.default.normalize(config.output);
    if (!config.spaces)
        config.spaces = 0;
    if (!config.verbose)
        config.verbose = false;
    return config;
}
