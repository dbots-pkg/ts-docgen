import { JSONOutput } from 'typedoc';
import { customSettings, ProjectData } from './index';
import { classDoc } from './util/class';
import { typedefDoc } from './util/typedef';
export declare const FORMAT_VERSION = 20;
export declare type DeclarationReflection = JSONOutput.DeclarationReflection;
export declare function generateFinalOutput(codeDocs: codeDoc, customDocs: customSettings): {
    classes: classDoc[];
    typedefs: typedefDoc[];
    meta: {
        version: string;
        format: number;
        date: number;
    };
    custom: customSettings;
};
interface codeDoc {
    classes: classDoc[];
    typedefs: typedefDoc[];
}
export declare function generateDocs(data: ProjectData): codeDoc;
export declare type docMeta = {
    line: number;
    file: string;
    path: string;
};
export declare function parseMeta(element: DeclarationReflection): docMeta | undefined;
export {};
