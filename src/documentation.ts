import path from 'path'
import { JSONOutput } from 'typedoc'
import { customSettings, ProjectData } from './index'
import { classDoc, parseClass } from './util/class'
import { typedefDoc, parseTypedef } from './util/typedef'
import { version } from '../package.json'

export const FORMAT_VERSION = 20

export type DeclarationReflection = JSONOutput.DeclarationReflection

export function generateFinalOutput(codeDocs: codeDoc, customDocs: customSettings) {
  return {
    meta: {
      version,
      format: FORMAT_VERSION,
      date: Date.now()
    },
    custom: customDocs,
    ...codeDocs
  }
}

interface codeDoc {
  classes: classDoc[]
  // interfaces: unknown[]
  // external: unknown[]
  typedefs: typedefDoc[]
}
export function generateDocs(data: ProjectData): codeDoc {
  const classes = [],
    // interfaces = [], // not using this at the moment
    // externals = [], // ???
    typedefs = []

  const modules = data.children?.filter(c => c.kindString == 'Module')

  if (modules) {
    for (const module of modules) {
      if (!module.children || module.children.length == 0) continue

      for (const rootElement of module.children) {
        const { type, value } = parseRootElement(rootElement)
        if (!value) continue

        if (type == 'class') classes.push(value)
        // if (type == 'interface') interfaces.push(value)
        if (type == 'typedef') typedefs.push(value)
        // if (type == 'external') externals.push(value)
      }
    }
  }

  return {
    classes,
    // interfaces,
    // externals,
    typedefs
  }
}

function parseRootElement(element: DeclarationReflection) {
  switch (element.kindString) {
    case 'Class':
      return {
        type: 'class',
        value: parseClass(element)
      }

    case 'Interface':
    case 'Type alias':
      return {
        type: 'typedef',
        value: parseTypedef(element)
      }

    // Externals?

    default:
      return {}
  }
}

export type docMeta = {
  line: number
  file: string
  path: string
}

export function parseMeta(element: DeclarationReflection): docMeta | undefined {
  const meta = (element.sources || [])[0]

  if (meta)
    return {
      line: meta.line,
      file: path.basename(meta.fileName),
      path: path.dirname(meta.fileName)
    }
}
