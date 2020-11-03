import { DeclarationReflection } from '../documentation';
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
}
export declare function parseTypedef(element: DeclarationReflection): typedefDoc;
