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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseParam = exports.parseClassMethod = exports.parseClass = void 0;
var documentation_1 = require("../documentation");
var types_1 = require("./types");
function parseClass(element) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var extended = (element.extendedTypes || [])[0];
    var implemented = (element.implementedTypes || [])[0];
    var construct = (_a = element.children) === null || _a === void 0 ? void 0 : _a.find(function (c) { return c.kindString == 'Constructor'; });
    // Ignore setter-only accessors (the typings still exist, but the docs don't show them)
    var props = (_b = element.children) === null || _b === void 0 ? void 0 : _b.filter(function (c) { var _a; return c.kindString == 'Property' || (c.kindString == 'Accessor' && ((_a = c.getSignature) === null || _a === void 0 ? void 0 : _a.length)); });
    var methods = (_c = element.children) === null || _c === void 0 ? void 0 : _c.filter(function (c) { return c.kindString == 'Method'; });
    var events = (_d = element.children) === null || _d === void 0 ? void 0 : _d.filter(function (c) { return c.kindString == 'Event'; });
    return {
        name: element.name,
        description: (_e = element.comment) === null || _e === void 0 ? void 0 : _e.shortText,
        see: (_g = (_f = element.comment) === null || _f === void 0 ? void 0 : _f.tags) === null || _g === void 0 ? void 0 : _g.filter(function (t) { return t.tag == 'see'; }).map(function (t) { return t.text; }),
        extends: extended ? [types_1.parseTypeSimple(extended)] : undefined,
        implements: implemented ? [types_1.parseTypeSimple(implemented)] : undefined,
        access: element.flags.isPrivate || ((_j = (_h = element.comment) === null || _h === void 0 ? void 0 : _h.tags) === null || _j === void 0 ? void 0 : _j.some(function (t) { return t.tag == 'private'; }))
            ? 'private'
            : undefined,
        abstract: ((_l = (_k = element.comment) === null || _k === void 0 ? void 0 : _k.tags) === null || _l === void 0 ? void 0 : _l.some(function (t) { return t.tag == 'abstract'; })) || undefined,
        deprecated: ((_o = (_m = element.comment) === null || _m === void 0 ? void 0 : _m.tags) === null || _o === void 0 ? void 0 : _o.some(function (t) { return t.tag == 'deprecated'; })) || undefined,
        construct: construct ? parseClassMethod(construct) : undefined,
        props: props && props.length > 0 ? props.map(parseClassProp) : undefined,
        methods: methods && methods.length > 0 ? methods.map(parseClassMethod) : undefined,
        events: events && events.length > 0 ? events.map(parseClassEvent) : undefined,
        meta: documentation_1.parseMeta(element)
    };
}
exports.parseClass = parseClass;
function parseClassProp(element) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    var base = {
        name: element.name,
        description: (_a = element.comment) === null || _a === void 0 ? void 0 : _a.shortText,
        see: (_c = (_b = element.comment) === null || _b === void 0 ? void 0 : _b.tags) === null || _c === void 0 ? void 0 : _c.filter(function (t) { return t.tag == 'see'; }).map(function (t) { return t.text; }),
        scope: element.flags.isStatic ? 'static' : undefined,
        access: element.flags.isPrivate || ((_e = (_d = element.comment) === null || _d === void 0 ? void 0 : _d.tags) === null || _e === void 0 ? void 0 : _e.some(function (t) { return t.tag == 'private'; }))
            ? 'private'
            : undefined,
        // @ts-expect-error // isReadonly is not in the typings, but appears in the JSON output
        readonly: element.flags.isReadonly || undefined,
        abstract: ((_g = (_f = element.comment) === null || _f === void 0 ? void 0 : _f.tags) === null || _g === void 0 ? void 0 : _g.some(function (t) { return t.tag == 'abstract'; })) || undefined,
        deprecated: ((_j = (_h = element.comment) === null || _h === void 0 ? void 0 : _h.tags) === null || _j === void 0 ? void 0 : _j.some(function (t) { return t.tag == 'deprecated'; })) || undefined,
        default: element.defaultValue,
        type: element.type ? types_1.parseType(element.type) : undefined,
        meta: documentation_1.parseMeta(element)
    };
    if (element.kindString == 'Accessor') {
        // I'll just ignore set signatures: if there's a getter, I'll take the docs from that
        // If a set signature is not present at all, I'll mark the prop as readonly.
        var getter = (element.getSignature || [])[0];
        var hasSetter = !!((_k = element.setSignature) === null || _k === void 0 ? void 0 : _k.length);
        var res = __assign({}, base);
        if (!getter) {
            // This should never happen, it should be avoided before this function is called.
            throw new Error("Can't parse accessor without getter.");
        }
        if (!hasSetter)
            res.readonly = true;
        return __assign(__assign({}, res), { description: (_l = getter.comment) === null || _l === void 0 ? void 0 : _l.shortText, see: (_o = (_m = getter.comment) === null || _m === void 0 ? void 0 : _m.tags) === null || _o === void 0 ? void 0 : _o.filter(function (t) { return t.tag == 'see'; }).map(function (t) { return t.text; }), access: getter.flags.isPrivate || ((_q = (_p = getter.comment) === null || _p === void 0 ? void 0 : _p.tags) === null || _q === void 0 ? void 0 : _q.some(function (t) { return t.tag == 'private'; }))
                ? 'private'
                : undefined, readonly: res.readonly || !hasSetter || undefined, abstract: ((_s = (_r = getter.comment) === null || _r === void 0 ? void 0 : _r.tags) === null || _s === void 0 ? void 0 : _s.some(function (t) { return t.tag == 'abstract'; })) || undefined, deprecated: ((_u = (_t = getter.comment) === null || _t === void 0 ? void 0 : _t.tags) === null || _u === void 0 ? void 0 : _u.some(function (t) { return t.tag == 'deprecated'; })) || undefined, default: res.default || getter.defaultValue });
    }
    return base;
}
function parseClassMethod(element) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var signature = ((element.signatures || [])[0] || element);
    return {
        name: element.name,
        description: (_a = signature.comment) === null || _a === void 0 ? void 0 : _a.shortText,
        see: (_c = (_b = signature.comment) === null || _b === void 0 ? void 0 : _b.tags) === null || _c === void 0 ? void 0 : _c.filter(function (t) { return t.tag == 'see'; }).map(function (t) { return t.text; }),
        scope: element.flags.isStatic ? 'static' : undefined,
        access: element.flags.isPrivate || ((_e = (_d = signature.comment) === null || _d === void 0 ? void 0 : _d.tags) === null || _e === void 0 ? void 0 : _e.some(function (t) { return t.tag == 'private'; }))
            ? 'private'
            : undefined,
        examples: (_g = (_f = signature.comment) === null || _f === void 0 ? void 0 : _f.tags) === null || _g === void 0 ? void 0 : _g.filter(function (t) { return t.tag == 'example'; }).map(function (t) { return t.text; }),
        abstract: ((_j = (_h = signature.comment) === null || _h === void 0 ? void 0 : _h.tags) === null || _j === void 0 ? void 0 : _j.some(function (t) { return t.tag == 'abstract'; })) || undefined,
        deprecated: ((_l = (_k = signature.comment) === null || _k === void 0 ? void 0 : _k.tags) === null || _l === void 0 ? void 0 : _l.some(function (t) { return t.tag == 'deprecated'; })) || undefined,
        emits: (_o = (_m = signature.comment) === null || _m === void 0 ? void 0 : _m.tags) === null || _o === void 0 ? void 0 : _o.filter(function (t) { return t.tag == 'emits'; }).map(function (t) { return t.text; }),
        params: signature.parameters ? signature.parameters.map(parseParam) : undefined,
        returns: signature.type ? types_1.parseType(signature.type) : undefined,
        returnsDescription: (_p = signature.comment) === null || _p === void 0 ? void 0 : _p.returns,
        meta: documentation_1.parseMeta(element)
    };
}
exports.parseClassMethod = parseClassMethod;
function parseParam(param) {
    var _a, _b, _c, _d;
    return {
        name: param.name,
        description: ((_b = (_a = param.comment) === null || _a === void 0 ? void 0 : _a.shortText) === null || _b === void 0 ? void 0 : _b.trim()) || ((_d = (_c = param.comment) === null || _c === void 0 ? void 0 : _c.text) === null || _d === void 0 ? void 0 : _d.trim()),
        optional: param.flags.isOptional || undefined,
        default: param.defaultValue,
        type: param.type ? types_1.parseType(param.type) : undefined
    };
}
exports.parseParam = parseParam;
function parseClassEvent(element) {
    return parseClassMethod(element);
}
