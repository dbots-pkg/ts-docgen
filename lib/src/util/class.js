"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseParam = exports.parseClass = void 0;
var documentation_1 = require("../documentation");
var types_1 = require("./types");
function parseClass(element) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var extended = (element.extendedTypes || [])[0];
    var implemented = (element.implementedTypes || [])[0];
    var construct = (_a = element.children) === null || _a === void 0 ? void 0 : _a.find(function (c) { return c.kindString == 'Constructor'; });
    var props = (_b = element.children) === null || _b === void 0 ? void 0 : _b.filter(function (c) { return c.kindString == 'Property'; });
    var methods = (_c = element.children) === null || _c === void 0 ? void 0 : _c.filter(function (c) { return c.kindString == 'Method'; });
    var events = (_d = element.children) === null || _d === void 0 ? void 0 : _d.filter(function (c) { return c.kindString == 'Event'; });
    return {
        name: element.name,
        description: (_e = element.comment) === null || _e === void 0 ? void 0 : _e.shortText,
        see: (_g = (_f = element.comment) === null || _f === void 0 ? void 0 : _f.tags) === null || _g === void 0 ? void 0 : _g.filter(function (t) { return t.tag == 'see'; }).map(function (t) { return t.text; }),
        extends: extended ? [types_1.parseTypeSimple(extended)] : undefined,
        implements: implemented ? [types_1.parseTypeSimple(implemented)] : undefined,
        access: element.flags.isPrivate ? 'private' : undefined,
        abstract: ((_j = (_h = element.comment) === null || _h === void 0 ? void 0 : _h.tags) === null || _j === void 0 ? void 0 : _j.some(function (t) { return t.tag == 'abstract'; })) || undefined,
        deprecated: ((_l = (_k = element.comment) === null || _k === void 0 ? void 0 : _k.tags) === null || _l === void 0 ? void 0 : _l.some(function (t) { return t.tag == 'deprecated'; })) || undefined,
        construct: construct ? parseClassMethod(construct) : undefined,
        props: (props && props.length > 0) ? props.map(parseClassProp) : undefined,
        methods: (methods && methods.length > 0) ? methods.map(parseClassMethod) : undefined,
        events: (events && events.length > 0) ? events.map(parseClassEvent) : undefined,
        meta: documentation_1.parseMeta(element)
    };
}
exports.parseClass = parseClass;
function parseClassProp(element) {
    var _a, _b, _c, _d, _e, _f, _g;
    return {
        name: element.name,
        description: (_a = element.comment) === null || _a === void 0 ? void 0 : _a.shortText,
        see: (_c = (_b = element.comment) === null || _b === void 0 ? void 0 : _b.tags) === null || _c === void 0 ? void 0 : _c.filter(function (t) { return t.tag == 'see'; }).map(function (t) { return t.text; }),
        scope: element.flags.isStatic ? 'static' : undefined,
        access: element.flags.isPrivate ? 'private' : undefined,
        // @ts-expect-error // isReadonly is not in the typings, but appears in the JSON output
        readonly: element.flags.isReadonly || undefined,
        abstract: ((_e = (_d = element.comment) === null || _d === void 0 ? void 0 : _d.tags) === null || _e === void 0 ? void 0 : _e.some(function (t) { return t.tag == 'abstract'; })) || undefined,
        deprecated: ((_g = (_f = element.comment) === null || _f === void 0 ? void 0 : _f.tags) === null || _g === void 0 ? void 0 : _g.some(function (t) { return t.tag == 'deprecated'; })) || undefined,
        default: element.defaultValue,
        type: element.type ? types_1.parseType(element.type) : undefined,
        meta: documentation_1.parseMeta(element)
    };
}
function parseClassMethod(element) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var signature = ((element.signatures || [])[0] || element);
    return {
        name: element.name,
        description: (_a = signature.comment) === null || _a === void 0 ? void 0 : _a.shortText,
        see: (_c = (_b = signature.comment) === null || _b === void 0 ? void 0 : _b.tags) === null || _c === void 0 ? void 0 : _c.filter(function (t) { return t.tag == 'see'; }).map(function (t) { return t.text; }),
        scope: element.flags.isStatic ? 'static' : undefined,
        access: element.flags.isPrivate ? 'private' : undefined,
        examples: (_e = (_d = signature.comment) === null || _d === void 0 ? void 0 : _d.tags) === null || _e === void 0 ? void 0 : _e.filter(function (t) { return t.tag == 'example'; }).map(function (t) { return t.text; }),
        abstract: ((_g = (_f = signature.comment) === null || _f === void 0 ? void 0 : _f.tags) === null || _g === void 0 ? void 0 : _g.some(function (t) { return t.tag == 'abstract'; })) || undefined,
        deprecated: ((_j = (_h = signature.comment) === null || _h === void 0 ? void 0 : _h.tags) === null || _j === void 0 ? void 0 : _j.some(function (t) { return t.tag == 'deprecated'; })) || undefined,
        emits: (_l = (_k = signature.comment) === null || _k === void 0 ? void 0 : _k.tags) === null || _l === void 0 ? void 0 : _l.filter(function (t) { return t.tag == 'emits'; }).map(function (t) { return t.text.replace(/#/, '#e-'); }),
        params: signature.parameters ? signature.parameters.map(parseParam) : undefined,
        returns: signature.type ? types_1.parseType(signature.type) : undefined,
        returnsDescription: (_m = signature.comment) === null || _m === void 0 ? void 0 : _m.returns,
        meta: documentation_1.parseMeta(element)
    };
}
function parseParam(param) {
    var _a;
    return {
        name: param.name,
        description: (_a = param.comment) === null || _a === void 0 ? void 0 : _a.shortText,
        optional: param.flags.isOptional || undefined,
        default: param.defaultValue,
        type: param.type ? types_1.parseType(param.type) : undefined
    };
}
exports.parseParam = parseParam;
function parseClassEvent(element) {
    return parseClassMethod(element);
}
