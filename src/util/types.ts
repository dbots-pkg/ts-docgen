import { JSONOutput } from 'typedoc'
import { SomeType } from 'typedoc/dist/lib/serialization/schema'
import { DeclarationReflection } from '../documentation'

// #region Type-guard functions
function isArrayType(value: any): value is JSONOutput.ArrayType {
  return typeof value == 'object' && value.type == 'array'
}
function isConditionalType(value: any): value is JSONOutput.ConditionalType {
  return typeof value == 'object' && value.type == 'conditional'
}
function isIndexedAccessType(value: any): value is JSONOutput.IndexedAccessType {
  return typeof value == 'object' && value.type == 'indexedAccess'
}
function isInferredType(value: any): value is JSONOutput.InferredType {
  return typeof value == 'object' && value.type == 'inferred'
}
function isIntersectionType(value: any): value is JSONOutput.IntersectionType {
  return typeof value == 'object' && value.type == 'intersection'
}
function isIntrinsicType(value: any): value is JSONOutput.IntrinsicType {
  return typeof value == 'object' && value.type == 'intrinsic'
}
function isPredicateType(value: any): value is JSONOutput.PredicateType {
  return typeof value == 'object' && value.type == 'predicate'
}
function isReferenceType(value: any): value is JSONOutput.ReferenceType {
  return typeof value == 'object' && value.type == 'reference'
}
function isReflectionType(value: any): value is JSONOutput.ReflectionType {
  return typeof value == 'object' && value.type == 'reflection'
}
function isStringLiteralType(value: any): value is JSONOutput.StringLiteralType {
  return typeof value == 'object' && value.type == 'stringLiteral'
}
function isTupleType(value: any): value is JSONOutput.TupleType {
  return typeof value == 'object' && value.type == 'tuple'
}
function isTypeOperatorType(value: any): value is JSONOutput.TypeOperatorType {
  return typeof value == 'object' && value.type == 'typeOperator'
}
function isTypeParameterType(value: any): value is JSONOutput.TypeParameterType {
  return typeof value == 'object' && value.type == 'typeParameter'
}
function isUnionType(value: any): value is JSONOutput.UnionType {
  return typeof value == 'object' && value.type == 'union'
}
function isUnknownType(value: any): value is JSONOutput.UnknownType {
  return typeof value == 'object' && value.type == 'unknown'
}

export const typeUtil = {
  isArrayType,
  isConditionalType,
  isIndexedAccessType,
  isInferredType,
  isIntersectionType,
  isIntrinsicType,
  isPredicateType,
  isReferenceType,
  isReflectionType,
  isStringLiteralType,
  isTupleType,
  isTypeOperatorType,
  isTypeParameterType,
  isUnionType,
  isUnknownType
}
// #endregion

export function parseTypeSimple(t: JSONOutput.SomeType): string {
  const parseType = parseTypeSimple

  if (isArrayType(t)) {
    return `Array<${parseType(t.elementType)}>`
  }
  if (isConditionalType(t)) {
    const { checkType, extendsType, trueType, falseType } = t
    return `${parseType(checkType)} extends ${parseType(extendsType)} ? ${parseType(trueType)} : ${parseType(falseType)}`
  }
  if (isIndexedAccessType(t)) {
    return `${parseType(t.objectType)}[${parseType(t.indexType)}]`
  }
  if (isIntersectionType(t)) {
    return t.types.map(parseType).join(' & ')
  }
  if (isPredicateType(t)) {
    return (t.asserts ? 'asserts ' : '') + t.name + (t.targetType ? ` is ${parseType(t.targetType)}` : '')
  }
  if (isReferenceType(t)) {
    return t.name + (t.typeArguments ? `<${t.typeArguments.map(parseType).join(', ')}>` : '')
  }
  if (isReflectionType(t)) {
    const obj = {} as Record<string, any>

    const { children, signatures } = (t.declaration as DeclarationReflection)

    // This is run when we're parsing interface-like declaration
    if (children && children.length > 0) {
      for (const child of children) {
        const { type } = child as DeclarationReflection
        if (type)
          obj[child.name] = parseType(type)
      }
      return `{\n${Object.entries(obj).map(([key, value]) => `${key}: ${value}`).join(',\n')}\n}`
    }

    // This is run if we're parsing a function type
    if (signatures && signatures.length > 0) {
      const s = signatures[0] as DeclarationReflection,
        params = (s.parameters as DeclarationReflection[])?.map(p => `${p.name}: ${p.type ? parseType(p.type) : 'unknown'}`)
      return `(${params.join(', ')}) => ${s.type ? parseType(s.type) : 'unknown'}`
    }

    return '{}'
  }
  if (isStringLiteralType(t)) {
    return `'${t.value}'`
  }
  if (isTupleType(t)) {
    return `[${(t.elements || []).map(parseType).join(', ')}]`
  }
  if (isTypeOperatorType(t)) {
    return `${t.operator} ${parseType(t.target)}`
  }
  if (isUnionType(t)) {
    return t.types
      .map(parseType)
      .filter(s => !!s && s.trim().length > 0)
      .join(' | ')
  }
  if (isInferredType(t) || isIntrinsicType(t) || isTypeParameterType(t) || isUnknownType(t)) {
    return t.name
  }

  return 'unknown'
}

const splitVarName = (str: string) => {
  if (str === '*') return ['*']
  if (str.includes(' | ')) return [[str]]

  str = str.replace(/\./g, '')
  const matches = str.match(/([\w*{}]+)([^\w*]+)/g)
  const output = []
  if (matches) {
    for (const match of matches) {
      const groups = match.match(/([\w*{}]+)([^\w*]+)/)
      groups && output.push([groups[1], groups[2]])
    }
  } else {
    output.push([(str.match(/([\w*{}]+)/g) || [])[0]])
  }
  return output
}

export type docType = string[][] | string[][][]
export function parseType(t: SomeType) {
  return [splitVarName(parseTypeSimple(t)) as string[][]]
}

export declare function assert<T>(val: any): asserts val is T
