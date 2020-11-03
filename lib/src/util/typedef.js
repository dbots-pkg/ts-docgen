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
exports.parseTypedef = void 0;
var types_1 = require("./types");
function parseTypedef(element) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var baseReturn = {
        name: element.name,
        description: (_a = element.comment) === null || _a === void 0 ? void 0 : _a.shortText,
        see: (_c = (_b = element.comment) === null || _b === void 0 ? void 0 : _b.tags) === null || _c === void 0 ? void 0 : _c.filter(function (t) { return t.tag == 'see'; }).map(function (t) { return t.text; }),
        access: element.flags.isPrivate ? 'private' : undefined,
        deprecated: ((_e = (_d = element.comment) === null || _d === void 0 ? void 0 : _d.tags) === null || _e === void 0 ? void 0 : _e.some(function (t) { return t.tag == 'deprecated'; })) || undefined,
        type: element.type ? types_1.parseType(element.type) : undefined
    };
    if (types_1.typeUtil.isReflectionType(element.type)) {
        var typeDef = element.type.declaration;
        if (typeDef) {
            var children = typeDef.children, signatures = typeDef.signatures;
            if (children && children.length > 0) {
                // It's an instance-like typedef
                var props = children
                    .map(function (child) {
                    var _a, _b;
                    return ({
                        name: child.name,
                        description: ((_a = child.comment) === null || _a === void 0 ? void 0 : _a.shortText) || ((_b = (child.signatures || [])[0].comment) === null || _b === void 0 ? void 0 : _b.shortText),
                        optional: child.flags.isOptional || undefined,
                        default: child.defaultValue,
                        type: child.type ? types_1.parseType(child.type) : undefined
                    });
                });
                return __assign(__assign({}, baseReturn), { props: props });
            }
            if (signatures && signatures.length > 0) {
                // For some reason, it's a function typedef
                var sig = signatures[0];
                var params = (_f = sig
                    .parameters) === null || _f === void 0 ? void 0 : _f.map(function (param) {
                    var _a;
                    return ({
                        name: param.name,
                        description: (_a = param.comment) === null || _a === void 0 ? void 0 : _a.shortText,
                        optional: param.flags.isOptional || undefined,
                        default: param.defaultValue,
                        type: param.type ? types_1.parseType(param.type) : undefined
                    });
                });
                return __assign(__assign({}, baseReturn), { description: (_g = sig.comment) === null || _g === void 0 ? void 0 : _g.shortText, see: (_j = (_h = sig.comment) === null || _h === void 0 ? void 0 : _h.tags) === null || _j === void 0 ? void 0 : _j.filter(function (t) { return t.tag == 'see'; }).map(function (t) { return t.text; }), deprecated: ((_l = (_k = sig.comment) === null || _k === void 0 ? void 0 : _k.tags) === null || _l === void 0 ? void 0 : _l.some(function (t) { return t.tag == 'deprecated'; })) || undefined, params: params, returns: sig.type ? types_1.parseType(sig.type) : undefined, returnsDescription: (_m = sig.comment) === null || _m === void 0 ? void 0 : _m.returns });
            }
        }
        // It shouldn't happen, but let's keep it here...
        return baseReturn;
    }
    else {
        // It's neither an interface-like or a function type
        return baseReturn;
    }
}
exports.parseTypedef = parseTypedef;
