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
interface Config {
    /** Source directories to parse TypeDoc in */
    source?: string[];
    /** Path ot an existing TypeDoc JSON output file */
    existingOutput?: string;
    /** Custom docs definition file to use */
    custom?: string;
    /** Root directory of the project */
    root?: string;
    /** Path to output file */
    output?: string;
    /** Number of spaces to use in output JSON */
    spaces?: number;
    /** Path to your tsconfig file */
    tsconfig?: string;
    /** Logs extra information to the console */
    verbose?: boolean;
    /** Path to JSON/YAML config file with the options above*/
    config?: string;
}
export declare function runGenerator(config: Config): void;
export {};
