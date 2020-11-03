import { JSONOutput } from 'typedoc';
export declare type ProjectData = JSONOutput.ProjectReflection;
export interface customSettings extends Record<string, {
    name: string;
    files: Record<string, {
        name: string;
        type: string;
        content: string;
        path: string;
    } | null>;
}> {
}
