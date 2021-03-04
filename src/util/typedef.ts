import { DeclarationReflection, docMeta, parseMeta } from '../documentation'
import { classMethodParamDoc } from './class'
import { docType, parseType, typeUtil } from './types'

export interface typedefDoc {
  name: string
  description?: string
  see?: string[]
  access?: 'private'
  deprecated?: true
  type?: docType
  props?: classMethodParamDoc[]
  params?: classMethodParamDoc[]
  returns?: docType
  returnsDescription?: string
  meta?: docMeta
}
export function parseTypedef(element: DeclarationReflection): typedefDoc {
  const baseReturn: typedefDoc = {
    name: element.name,
    description: element.comment?.shortText,
    see: element.comment?.tags?.filter((t) => t.tag == 'see').map((t) => t.text),
    access:
      element.flags.isPrivate || element.comment?.tags?.some((t) => t.tag == 'private')
        ? 'private'
        : undefined,
    deprecated: element.comment?.tags?.some((t) => t.tag == 'deprecated') || undefined,
    type: element.type ? parseType(element.type) : undefined,
    meta: parseMeta(element)
  }

  let typeDef: DeclarationReflection | undefined
  if (typeUtil.isReflectionType(element.type)) {
    typeDef = element.type.declaration
  } else if (element.kindString == 'Interface') {
    typeDef = element
  } else if (element.kindString == 'Enumeration') {
    return {
      ...baseReturn,
      props: element.children?.length
        ? element.children.map((child) => ({
            name: child.name,
            description: child.comment?.shortText,
            type: typeof child.defaultValue != 'undefined' ? [[[child.defaultValue]]] : undefined
          }))
        : undefined
    }
  }

  if (typeDef) {
    const { children, signatures } = typeDef

    // It's an instance-like typedef
    if (children && children.length > 0) {
      const props: classMethodParamDoc[] = children.map((child) => ({
        name: child.name,
        description: child.comment?.shortText || (child.signatures || [])[0]?.comment?.shortText,
        optional: child.flags.isOptional || typeof child.defaultValue != 'undefined' || undefined,
        default:
          child.defaultValue ||
          child.comment?.tags?.find((t) => t.tag == 'default')?.text ||
          undefined,
        type: child.type
          ? parseType(child.type)
          : child.kindString == 'Method'
          ? parseType({
              type: 'reflection',
              declaration: child
            })
          : undefined
      }))

      return {
        ...baseReturn,
        props
      }
    }

    // For some reason, it's a function typedef
    if (signatures && signatures.length > 0) {
      const sig = signatures[0]

      const params: classMethodParamDoc[] | undefined = sig.parameters?.map((param) => ({
        name: param.name,
        description: param.comment?.shortText,
        optional: param.flags.isOptional || typeof param.defaultValue != 'undefined' || undefined,
        default:
          param.defaultValue ||
          param.comment?.tags?.find((t) => t.tag == 'default')?.text ||
          undefined,
        type: param.type ? parseType(param.type) : undefined
      }))

      return {
        ...baseReturn,
        description: sig.comment?.shortText,
        see: sig.comment?.tags?.filter((t) => t.tag == 'see').map((t) => t.text),
        deprecated: sig.comment?.tags?.some((t) => t.tag == 'deprecated') || undefined,

        params,
        returns: sig.type ? parseType(sig.type) : undefined,
        returnsDescription: sig.comment?.returns
      }
    }
  }

  // It's neither an interface-like or a function type
  return baseReturn
}
