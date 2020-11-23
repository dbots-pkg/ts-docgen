import { DeclarationReflection, docMeta } from '../documentation';
import { classMethodParamDoc } from './class';
import { docType } from './types';
export interface typedefDoc {
    name: string;
    description?: string;
    see?: string[];
    access?: 'private';
    deprecated?: true;
    type?: docType;
    props?: classMethodParamDoc[];
    params?: classMethodParamDoc[];
    returns?: docType;
    returnsDescription?: string;
    meta?: docMeta;
}
export declare function parseTypedef(element: DeclarationReflection): typedefDoc;
