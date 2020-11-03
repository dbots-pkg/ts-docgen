"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseType = exports.parseTypeSimple = exports.typeUtil = void 0;
// #region Type-guard functions
function isArrayType(value) {
    return typeof value == 'object' && value.type == 'array';
}
function isConditionalType(value) {
    return typeof value == 'object' && value.type == 'conditional';
}
function isIndexedAccessType(value) {
    return typeof value == 'object' && value.type == 'indexedAccess';
}
function isInferredType(value) {
    return typeof value == 'object' && value.type == 'inferred';
}
function isIntersectionType(value) {
    return typeof value == 'object' && value.type == 'intersection';
}
function isIntrinsicType(value) {
    return typeof value == 'object' && value.type == 'intrinsic';
}
function isPredicateType(value) {
    return typeof value == 'object' && value.type == 'predicate';
}
function isReferenceType(value) {
    return typeof value == 'object' && value.type == 'reference';
}
function isReflectionType(value) {
    return typeof value == 'object' && value.type == 'reflection';
}
function isStringLiteralType(value) {
    return typeof value == 'object' && value.type == 'stringLiteral';
}
function isTupleType(value) {
    return typeof value == 'object' && value.type == 'tuple';
}
function isTypeOperatorType(value) {
    return typeof value == 'object' && value.type == 'typeOperator';
}
function isTypeParameterType(value) {
    return typeof value == 'object' && value.type == 'typeParameter';
}
function isUnionType(value) {
    return typeof value == 'object' && value.type == 'union';
}
function isUnknownType(value) {
    return typeof value == 'object' && value.type == 'unknown';
}
exports.typeUtil = {
    isArrayType: isArrayType,
    isConditionalType: isConditionalType,
    isIndexedAccessType: isIndexedAccessType,
    isInferredType: isInferredType,
    isIntersectionType: isIntersectionType,
    isIntrinsicType: isIntrinsicType,
    isPredicateType: isPredicateType,
    isReferenceType: isReferenceType,
    isReflectionType: isReflectionType,
    isStringLiteralType: isStringLiteralType,
    isTupleType: isTupleType,
    isTypeOperatorType: isTypeOperatorType,
    isTypeParameterType: isTypeParameterType,
    isUnionType: isUnionType,
    isUnknownType: isUnknownType
};
// #endregion
function parseTypeSimple(t) {
    var _a;
    if (isArrayType(t)) {
        return "Array<" + parseType(t.elementType) + ">";
    }
    if (isConditionalType(t)) {
        var checkType = t.checkType, extendsType = t.extendsType, trueType = t.trueType, falseType = t.falseType;
        return parseType(checkType) + " extends " + parseType(extendsType) + " ? " + parseType(trueType) + " : " + parseType(falseType);
    }
    if (isIndexedAccessType(t)) {
        return parseType(t.objectType) + "[" + parseType(t.indexType) + "]";
    }
    if (isIntersectionType(t)) {
        return t.types.map(parseType).join(' & ');
    }
    if (isPredicateType(t)) {
        return (t.asserts ? 'asserts ' : '') + t.name + (t.targetType ? " is " + parseType(t.targetType) : '');
    }
    if (isReferenceType(t)) {
        return t.name + (t.typeArguments ? "<" + t.typeArguments.map(parseType).join(', ') + ">" : '');
    }
    if (isReflectionType(t)) {
        var obj = {};
        var _b = t.declaration, children = _b.children, signatures = _b.signatures;
        // This is run when we're parsing interface-like declaration
        if (children && children.length > 0) {
            for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                var child = children_1[_i];
                var type = child.type;
                if (type)
                    obj[child.name] = parseType(type);
            }
            return "{\n" + Object.entries(obj).map(function (_a) {
                var key = _a[0], value = _a[1];
                return key + ": " + value + "\n";
            }) + "}";
        }
        // This is run if we're parsing a function type
        if (signatures && signatures.length > 0) {
            var s = signatures[0], params = (_a = s.parameters) === null || _a === void 0 ? void 0 : _a.map(function (p) { return p.name + ": " + (p.type ? parseType(p.type) : 'unknown'); });
            return "(" + params.join(', ') + ") => " + (s.type ? parseType(s.type) : 'unknown');
        }
        return '{}';
    }
    if (isStringLiteralType(t)) {
        return t.value;
    }
    if (isTupleType(t)) {
        return "[" + (t.elements || []).map(parseType).join(', ') + "]";
    }
    if (isTypeOperatorType(t)) {
        return t.operator + " " + parseType(t.target);
    }
    if (isUnionType(t)) {
        return t.types.map(parseType).join(' | ');
    }
    if (isInferredType(t) || isIntrinsicType(t) || isTypeParameterType(t) || isUnknownType(t)) {
        return t.name;
    }
    return 'unknown';
}
exports.parseTypeSimple = parseTypeSimple;
var splitVarName = function (str) {
    if (str === '*')
        return ['*'];
    str = str.replace(/\./g, '');
    var matches = str.match(/([\w*]+)([^\w*]+)/g);
    var output = [];
    if (matches) {
        for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
            var match = matches_1[_i];
            var groups = match.match(/([\w*]+)([^\w*]+)/);
            groups && output.push([groups[1], groups[2]]);
        }
    }
    else {
        output.push([(str.match(/([\w*]+)/g) || [])[0]]);
    }
    return output;
};
function parseType(t) {
    return [splitVarName(parseTypeSimple(t))];
}
exports.parseType = parseType;
