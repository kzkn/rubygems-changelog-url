export declare type Gem = {
    name: string;
    projectUri: string | null;
    homepageUri: string | null;
    sourceCodeUri: string | null;
    changelogUri: string | null;
};
export declare function searchChangeLogUrl(gem: Gem): Promise<string | null>;
