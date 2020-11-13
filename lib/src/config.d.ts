#!/usr/bin/env node
declare const options: {
    [x: string]: unknown;
    source: string[] | undefined;
    existingOutput: string | undefined;
    custom: string | undefined;
    root: string;
    output: string | undefined;
    spaces: number;
    verbose: boolean;
    config: string | undefined;
    _: string[];
    $0: string;
};
export default options;
