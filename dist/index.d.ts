import * as github from './github';
export declare type Gem = {
    name: string;
    projectUri: string | null;
    homepageUri: string | null;
    sourceCodeUri: string | null;
    changelogUri: string | null;
};
declare type Option = github.Option;
export declare function searchChangeLogUrl(gem: Gem, option?: Option): Promise<string | null>;
export {};
