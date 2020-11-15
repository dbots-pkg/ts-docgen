import { DeclarationReflection } from '../documentation'
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
}
export function parseTypedef(element: DeclarationReflection): typedefDoc {
  const baseReturn: typedefDoc = {
    name: element.name,
    description: element.comment?.shortText,
    see: element.comment?.tags?.filter(t => t.tag == 'see').map(t => t.text),
    access: element.flags.isPrivate ? 'private' : undefined,
    deprecated: element.comment?.tags?.some(t => t.tag == 'deprecated') || undefined,
    type: element.type ? parseType(element.type) : undefined
  }

  let typeDef!: DeclarationReflection | undefined
  if (typeUtil.isReflectionType(element.type)) {
    typeDef = element.type.declaration as DeclarationReflection
  } else if (element.kindString == 'Interface') {
    typeDef = element
  }

  if (typeDef) {
    const { children, signatures } = typeDef

    if (children && children.length > 0) {
      // It's an instance-like typedef
      const props: classMethodParamDoc[] = children
        .map((child: DeclarationReflection) => ({
          name: child.name,
          description: child.comment?.shortText || (child.signatures || [])[0]?.comment?.shortText,
          optional: child.flags.isOptional || undefined,
          default: child.defaultValue,
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

    if (signatures && signatures.length > 0) {
      // For some reason, it's a function typedef
      const sig: DeclarationReflection = signatures[0]

      const params: classMethodParamDoc[] | undefined = sig
        .parameters?.map((param: DeclarationReflection) => ({
          name: param.name,
          description: param.comment?.shortText,
          optional: param.flags.isOptional || undefined,
          default: param.defaultValue,
          type: param.type ? parseType(param.type) : undefined
        }))

      return {
        ...baseReturn,
        description: sig.comment?.shortText,
        see: sig.comment?.tags?.filter(t => t.tag == 'see').map(t => t.text),
        deprecated: sig.comment?.tags?.some(t => t.tag == 'deprecated') || undefined,

        params,
        returns: sig.type ? parseType(sig.type) : undefined,
        returnsDescription: sig.comment?.returns
      }
    }
  }

  // It's neither an interface-like or a function type
  return baseReturn
}
