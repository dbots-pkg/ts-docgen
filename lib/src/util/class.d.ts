import { DeclarationReflection, docMeta } from '../documentation';
import { docType } from './types';
export interface classDoc {
    name: string;
    description?: string;
    see?: string[];
    extends?: [string];
    implements?: [string];
    access?: 'private';
    abstract?: true;
    deprecated?: true;
    construct?: classMethodDoc;
    props?: classPropDoc[];
    methods?: classMethodDoc[];
    events?: classEventDoc[];
    meta?: docMeta;
}
export declare function parseClass(element: DeclarationReflection): classDoc;
interface classPropDoc {
    name: string;
    description?: string;
    see?: string[];
    scope?: 'static';
    access?: 'private';
    readonly?: true;
    nullable?: never;
    abstract?: true;
    deprecated?: true;
    default?: string | boolean | number;
    type?: docType;
    props?: never;
    meta?: docMeta;
}
interface classMethodDoc {
    name: string;
    description?: string;
    see?: string[];
    scope?: 'static';
    access?: 'private';
    inherits?: never;
    inherited?: never;
    implements?: never;
    examples?: string[];
    abstract?: true;
    deprecated?: true;
    emits?: string[];
    throws?: never;
    params?: {
        name: string;
        description?: string;
        optional?: true;
        default?: string | boolean | number;
        variable?: never;
        nullable?: never;
        type?: docType;
    }[];
    async?: never;
    generator?: never;
    returns?: docType;
    returnsDescription?: string;
    meta?: docMeta;
}
export declare type classMethodParamDoc = Exclude<classMethodDoc['params'], undefined>[number];
export declare function parseParam(param: DeclarationReflection): classMethodParamDoc;
interface classEventDoc {
    name: string;
    description?: string;
    see?: string[];
    deprecated?: true;
    params?: {
        name: string;
        description?: string;
        optional?: true;
        default?: string | boolean | number;
        variable?: never;
        nullable?: never;
        type?: docType;
    }[];
    meta?: docMeta;
}
export {};
