export declare type Repository = {
    owner: string;
    name: string;
};
export declare type Option = {
    token?: string;
};
export declare function getContentUrl(repo: Repository, path: string, option?: Option): Promise<string>;
