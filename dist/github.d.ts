export type Repository = {
    owner: string;
    name: string;
};
export type Option = {
    token?: string;
};
export type GithubFileEntry = {
    path: string;
    mode: string;
    type: 'blob' | 'tree';
    size: number;
    sha: string;
    url: string;
};
export declare function getContentUrl(repo: Repository, path: string, option?: Option): Promise<string>;
export declare function getDefaultBranch(repo: Repository, option?: Option): Promise<string>;
export declare function getDirectoryEntries(repo: Repository, params: {
    branch: string;
    path: string | null;
}, option?: Option): Promise<GithubFileEntry[]>;
