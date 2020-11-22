"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../src/index");
index_1.runGenerator({
    existingOutput: 'examples/typedoc-out.json',
    output: 'test-output.json'
});
// const splitVarName = (str: string): string[] | string[][] => {
//   if (str === '*') return ['any']
//   // // @ts-expect-error
//   // // if (str.includes(' | ')) return str.split(' | ').map(splitVarName).map((r, i, a) => i != a.length - 1 ? [...r, [' | ']] : r)
//   // if (str.includes('|')) return str.split('|').map((r, i, a) => (i != a.length - 1) ? (r + '|') : r).map(splitVarName)
//   // str = str.replace(/\./g, '')
//   // const matches = str.match(/([\w*{}]+)([^\w*]+)/g)
//   // let output = []
//   // if (matches) {
//   //   for (const match of matches) {
//   //     const groups = match.match(/([\w*{}]+)([^\w*]+)/)
//   //     groups && output.push([groups[1], groups[2]])
//   //   }
//   // } else {
//   //   output.push([(str.match(/([\w*{}]+)/g) || [])[0]])
//   // }
//   // if (str.includes('=>')) output = [['('], ...output, ...splitVarName(str.split('=>')[1])] as string[][]
//   // return output
//   return str.split(/((?<=[-!$%^&*()_+|~=`{}[\]:";'<>?,./\s])|(?=[-!$%^&*()_+|~=`{}[\]:";'<>?,./\s]))/g).filter(s => !!s)
// }
// function ICantUseRegex(str: string) {
//   const res: string[][] = []
//   let currGroup: string[] = [],
//     currStr = ''
//   const isASymbol = (char: string) => '-!$%^&*()_+|~=`{}[]:";\'<>?,. '.includes(char)
//   for (const char of str) {
//     const currentlyInASymbolSection = isASymbol(currStr[0]),
//       charIsASymbol = isASymbol(char)
//     if (currStr.length && currentlyInASymbolSection != charIsASymbol) {
//       currGroup.push(currStr)
//       currStr = char
//       if (!charIsASymbol) {
//         res.push(currGroup)
//         currGroup = []
//       }
//     } else {
//       currStr += char
//     }
//   }
//   currGroup.push(currStr)
//   res.push(currGroup)
//   return res
// }
// const str = '(str: string, other: Record<any, ServiceBase|true>)) => ReturnType<any>'
// console.log(ICantUseRegex(str))
