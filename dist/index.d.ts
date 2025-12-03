import * as github from './github';
export type Gem = {
    name: string;
    projectUri: string | null;
    homepageUri: string | null;
    sourceCodeUri: string | null;
    changelogUri: string | null;
    licenses: string[] | null;
};
type Option = github.Option;
export declare function searchChangeLogUrl(gem: Gem, option?: Option): Promise<string | null>;
export {};
