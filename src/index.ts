import config from './config'
import { Application as TypeDoc, JSONOutput } from 'typedoc'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import util from 'util'
import { FORMAT_VERSION, generateDocs, generateFinalOutput } from './documentation'
import { deflateSync } from 'zlib'
const readFile = util.promisify(fs.readFile)

export type ProjectData = JSONOutput.ProjectReflection

const mainPromises = []

console.log('Parsing using TypeDoc...')
const files: string[] = []
for (const dir of config.source) files.push(`${dir}/*.ts`, `${dir}/**/*.ts`)
mainPromises[0] = new Promise((res, rej) => {
  const app = new TypeDoc(),
    tempDir = tmp.dirSync(),
    filePath = path.join(tempDir.name, 'project-reflection.json')

  const writeResult = app.generateJson(files, filePath)

  if (!writeResult) rej('Couldn\'t write temp file.')
  else {
    const data = require(filePath) as ProjectData
    if (typeof data == 'object') res(data)
    else rej('Couldn\'t access temp file.')
  }
})

// I'm using an interface only because otherwise it messe up my syntax highlighter
export interface customSettings extends Record<string, {
  name: string
  files: Record<
    string, {
      name: string
      type: string
      content: string
      path: string
    } | null>
}> { }
if (config.custom) {
  console.log('Loading custom docs files...')
  const customDir = path.dirname(config.custom)

  // Figure out what type of definitions file we're loading
  let type: string
  const defExtension = path.extname(config.custom).toLowerCase()
  if (defExtension === '.json') type = 'json'
  else if (defExtension === '.yml' || defExtension === '.yaml') type = 'yaml'
  else throw new TypeError('Unknown custom docs definition file type.')

  mainPromises[1] = readFile(config.custom, 'utf-8').then(defContent => {
    // Parse the definition file
    let definitions
    if (type === 'json') definitions = JSON.parse(defContent)
    else definitions = require('js-yaml').safeLoad(defContent)

    const custom: customSettings = {}
    const filePromises = []

    for (const cat of definitions) {
      // Add the category to the custom docs
      const catID = cat.id || cat.name.toLowerCase()
      const dir = path.join(customDir, cat.path || catID)
      const category: (typeof custom)['category'] = {
        name: cat.name || cat.id,
        files: {}
      }
      custom[catID] = category

      // Add every file in the category
      for (const file of cat.files) {
        const fileRootPath = path.join(dir, file.path)
        const extension = path.extname(file.path)
        const fileID = file.id || path.basename(file.path, extension)
        category.files[fileID] = null

        filePromises.push(readFile(fileRootPath, 'utf-8').then(content => {
          category.files[fileID] = {
            name: file.name,
            type: extension.toLowerCase().replace(/^\./, ''),
            content,
            path: path.relative(config.root, fileRootPath).replace(/\\/g, '/')
          }
          if (config.verbose) console.log(`Loaded custom docs file ${catID}/${fileID}`)
        }))
      }
    }

    return Promise.all(filePromises).then(() => {
      const fileCount = Object.keys(custom).map(k => Object.keys(custom[k])).reduce((prev, c) => prev + c.length, 0)
      const categoryCount = Object.keys(custom).length
      console.log(
        `${fileCount} custom docs file${fileCount !== 1 ? 's' : ''} in ` +
        `${categoryCount} categor${categoryCount !== 1 ? 'ies' : 'y'} loaded.`
      )
      return custom
    })
  })
}

Promise.all(mainPromises).then((results) => {
  const [data, custom] = results as [ProjectData, customSettings]

  console.log(`Serializing documentation with format version ${FORMAT_VERSION}...`)
  const docs = generateDocs(data)
  let output = JSON.stringify(generateFinalOutput(docs, custom), null, config.spaces)

  if (config.compress) {
    console.log('Compressing...')
    output = deflateSync(output).toString('utf8')
  }

  if (config.output) {
    console.log(`Writing to ${config.output}...`)
    fs.writeFileSync(config.output, output)
  }

  console.log('Done!')
  process.exit(0)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
