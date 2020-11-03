#!/usr/bin/env node
declare const options: {
    [x: string]: unknown;
    source: string[];
    custom: string | undefined;
    root: string;
    output: string | undefined;
    spaces: number;
    jsdoc: string | undefined;
    verbose: boolean;
    config: string | undefined;
    _: string[];
    $0: string;
};
export default options;
