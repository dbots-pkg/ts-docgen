"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMeta = exports.generateDocs = exports.generateFinalOutput = exports.FORMAT_VERSION = void 0;
var path_1 = __importDefault(require("path"));
var class_1 = require("./util/class");
var typedef_1 = require("./util/typedef");
var package_json_1 = require("../package.json");
exports.FORMAT_VERSION = 20;
function generateFinalOutput(codeDocs, customDocs) {
    return __assign({ meta: {
            version: package_json_1.version,
            format: exports.FORMAT_VERSION,
            date: Date.now()
        }, custom: customDocs }, codeDocs);
}
exports.generateFinalOutput = generateFinalOutput;
function generateDocs(data) {
    var _a;
    var classes = [], 
    // interfaces = [], // not using this at the moment
    // externals = [], // ???
    typedefs = [];
    var modules = (_a = data.children) === null || _a === void 0 ? void 0 : _a.filter(function (c) { return c.kindString == 'Module'; });
    if (modules) {
        for (var _i = 0, modules_1 = modules; _i < modules_1.length; _i++) {
            var module_1 = modules_1[_i];
            if (!module_1.children || module_1.children.length == 0)
                continue;
            for (var _b = 0, _c = module_1.children; _b < _c.length; _b++) {
                var rootElement = _c[_b];
                var _d = parseRootElement(rootElement), type = _d.type, value = _d.value;
                if (!value)
                    continue;
                if (type == 'class')
                    classes.push(value);
                // if (type == 'interface') interfaces.push(value)
                if (type == 'typedef')
                    typedefs.push(value);
                // if (type == 'external') externals.push(value)
            }
        }
    }
    return {
        classes: classes,
        // interfaces,
        // externals,
        typedefs: typedefs
    };
}
exports.generateDocs = generateDocs;
function parseRootElement(element) {
    switch (element.kindString) {
        case 'Class':
            return {
                type: 'class',
                value: class_1.parseClass(element)
            };
        case 'Interface':
        case 'Type alias':
        case 'Enumeration':
            return {
                type: 'typedef',
                value: typedef_1.parseTypedef(element)
            };
        // Externals?
        default:
            return {};
    }
}
function parseMeta(element) {
    var meta = (element.sources || [])[0];
    if (meta)
        return {
            line: meta.line,
            file: path_1.default.basename(meta.fileName),
            path: path_1.default.dirname(meta.fileName)
        };
}
exports.parseMeta = parseMeta;
