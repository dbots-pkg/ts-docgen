import { DeclarationReflection, docMeta, parseMeta } from '../documentation'
import { docType, parseType, parseTypeSimple } from './types'

export interface classDoc {
  name: string
  description?: string
  see?: string[]
  extends?: [string]
  implements?: [string]
  access?: 'private'
  abstract?: true
  deprecated?: true
  construct?: classMethodDoc
  props?: classPropDoc[]
  methods?: classMethodDoc[]
  events?: classEventDoc[]
  meta?: docMeta
}
export function parseClass(element: DeclarationReflection): classDoc {
  const extended = (element.extendedTypes || [])[0]
  const implemented = (element.implementedTypes || [])[0]
  const construct = element.children?.find(c => c.kindString == 'Constructor')
  const props = element.children?.filter(c => c.kindString == 'Property')
  const methods = element.children?.filter(c => c.kindString == 'Method')
  const events = element.children?.filter(c => c.kindString == 'Event')

  return {
    name: element.name,
    description: element.comment?.shortText,
    see: element.comment?.tags?.filter(t => t.tag == 'see').map(t => t.text),
    extends: extended ? [parseTypeSimple(extended)] : undefined,
    implements: implemented ? [parseTypeSimple(implemented)] : undefined,
    access: (element.flags.isPrivate || element.comment?.tags?.some(t => t.tag == 'private')) ? 'private' : undefined,
    abstract: element.comment?.tags?.some(t => t.tag == 'abstract') || undefined,
    deprecated: element.comment?.tags?.some(t => t.tag == 'deprecated') || undefined,
    construct: construct ? parseClassMethod(construct) : undefined,
    props: (props && props.length > 0) ? props.map(parseClassProp) : undefined,
    methods: (methods && methods.length > 0) ? methods.map(parseClassMethod) : undefined,
    events: (events && events.length > 0) ? events.map(parseClassEvent) : undefined,
    meta: parseMeta(element)
  }
}

interface classPropDoc {
  name: string
  description?: string
  see?: string[]
  scope?: 'static'
  access?: 'private'
  readonly?: true
  nullable?: never // it would already be in the type
  abstract?: true
  deprecated?: true
  default?: string | boolean | number
  type?: docType
  props?: never // prefer using a type reference (like a dedicated instance) instead of documenting using @property tags
  meta?: docMeta
}
function parseClassProp(element: DeclarationReflection): classPropDoc {
  return {
    name: element.name,
    description: element.comment?.shortText,
    see: element.comment?.tags?.filter(t => t.tag == 'see').map(t => t.text),
    scope: element.flags.isStatic ? 'static' : undefined,
    access: (element.flags.isPrivate || element.comment?.tags?.some(t => t.tag == 'private')) ? 'private' : undefined,
    // @ts-expect-error // isReadonly is not in the typings, but appears in the JSON output
    readonly: (element.flags.isReadonly as boolean) || undefined,
    abstract: element.comment?.tags?.some(t => t.tag == 'abstract') || undefined,
    deprecated: element.comment?.tags?.some(t => t.tag == 'deprecated') || undefined,
    default: element.defaultValue,
    type: element.type ? parseType(element.type) : undefined,
    meta: parseMeta(element)
  }
}

interface classMethodDoc {
  name: string
  description?: string
  see?: string[]
  scope?: 'static'
  access?: 'private'
  inherits?: never // let's just don't
  inherited?: never // let's just don't
  implements?: never // let's just don't
  examples?: string[]
  abstract?: true
  deprecated?: true
  emits?: string[]
  throws?: never // let's just don't
  params?: {
    name: string
    description?: string
    optional?: true
    default?: string | boolean | number
    variable?: never // it would already be in the type
    nullable?: never // it would already be in the type
    type?: docType
  }[]
  async?: never // it would already be in the type
  generator?: never // not used by djs
  returns?: docType
  returnsDescription?: string
  meta?: docMeta
}
export function parseClassMethod(element: DeclarationReflection): classMethodDoc {
  const signature = ((element.signatures || [])[0] || element) as DeclarationReflection

  return {
    name: element.name,
    description: signature.comment?.shortText,
    see: signature.comment?.tags?.filter(t => t.tag == 'see').map(t => t.text),
    scope: element.flags.isStatic ? 'static' : undefined,
    access: (element.flags.isPrivate || signature.comment?.tags?.some(t => t.tag == 'private')) ? 'private' : undefined,
    examples: signature.comment?.tags?.filter(t => t.tag == 'example').map(t => t.text),
    abstract: signature.comment?.tags?.some(t => t.tag == 'abstract') || undefined,
    deprecated: signature.comment?.tags?.some(t => t.tag == 'deprecated') || undefined,
    emits: signature.comment?.tags?.filter(t => t.tag == 'emits').map(t => t.text),
    params: signature.parameters ? signature.parameters.map(parseParam) : undefined,
    returns: signature.type ? parseType(signature.type) : undefined,
    returnsDescription: signature.comment?.returns,
    meta: parseMeta(element)
  }
}

export type classMethodParamDoc = Exclude<classMethodDoc['params'], undefined>[number]
export function parseParam(param: DeclarationReflection): classMethodParamDoc {
  return {
    name: param.name,
    description: param.comment?.shortText?.trim() || param.comment?.text?.trim(),
    optional: param.flags.isOptional || undefined,
    default: param.defaultValue,
    type: param.type ? parseType(param.type) : undefined
  }
}

interface classEventDoc {
  name: string
  description?: string
  see?: string[]
  deprecated?: true
  params?: {
    name: string
    description?: string
    optional?: true
    default?: string | boolean | number
    variable?: never // it would already be in the type
    nullable?: never // it would already be in the type
    type?: docType
  }[]
  meta?: docMeta
}
function parseClassEvent(element: DeclarationReflection): classEventDoc {
  return parseClassMethod(element)
}
