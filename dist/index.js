"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchChangeLogUrl = void 0;
const github = __importStar(require("./github"));
const GITHUB_REPOSITORY_URL_REGEXP = new RegExp('^https://github.com/([^/]+)/([^/]+)/?$');
const GITHUB_TREE_URL_REGEXP = new RegExp('^https://github.com/([^/]+)/([^/]+)/tree/[^/]+/(.+)$');
function isGithubRepositoryUrl(url) {
    return !!url.match(GITHUB_REPOSITORY_URL_REGEXP);
}
function isGithubTreeUrl(url) {
    return !!url.match(GITHUB_TREE_URL_REGEXP);
}
function findUrlBy(gem, finder) {
    const { projectUri, homepageUri, sourceCodeUri } = gem;
    return [projectUri, homepageUri, sourceCodeUri].find(uri => uri && finder(uri)) || null;
}
function githubRepositoryUrl(gem) {
    return findUrlBy(gem, isGithubRepositoryUrl);
}
function githubTreeUrl(gem) {
    return findUrlBy(gem, isGithubTreeUrl);
}
const FILENAMES = {
    ['CHANGELOG.md']: 0,
    ['ChangeLog.md']: 0,
    ['Changelog.md']: 2,
    ['changelog.md']: 3,
    ['CHANGELOG.txt']: 2,
    ['ChangeLog.txt']: 3,
    ['Changelog.txt']: 3,
    ['changelog.txt']: 3,
    ['CHANGELOG.rdoc']: 4,
    ['ChangeLog.rdoc']: 4,
    ['Changelog.rdoc']: 4,
    ['changelog.rdoc']: 4,
    ['CHANGELOG']: 2,
    ['ChangeLog']: 2,
    ['Changelog']: 3,
    ['changelog']: 3,
    ['HISTORY.md']: 1,
    ['History.md']: 1,
    ['history.md']: 3,
    ['HISTORY.txt']: 2,
    ['History.txt']: 3,
    ['history.txt']: 3,
    ['HISTORY.rdoc']: 4,
    ['History.rdoc']: 2,
    ['history.rdoc']: 4,
    ['HISTORY']: 3,
    ['History']: 3,
    ['history']: 3,
    ['NEWS.md']: 1,
    ['News.md']: 2,
    ['news.md']: 3,
    ['NEWS.txt']: 3,
    ['News.txt']: 3,
    ['news.txt']: 3,
    ['NEWS.rdoc']: 4,
    ['News.rdoc']: 4,
    ['news.rdoc']: 4,
    ['NEWS']: 2,
    ['News']: 3,
    ['news']: 3,
};
const SORTED_FILENAMES = Array.from(Object.entries(FILENAMES)).sort((a, b) => a[1] - b[1]).map(e => e[0]);
function tryGithubBlobChangeLog(repo, pathPrefix, option) {
    return __awaiter(this, void 0, void 0, function* () {
        const paths = SORTED_FILENAMES.map(fn => `${pathPrefix ? pathPrefix + '/' : ''}${fn}`);
        // NOTE: Deliberately looping to reduce the number of useless HTTP requests
        for (const path of paths) {
            try {
                return yield github.getContentUrl(repo, path, option);
            }
            catch (e) {
                if (!e.statusCode || e.statusCode >= 500) {
                    throw e;
                }
            }
        }
        return null;
    });
}
function tryGithubBlobChangeLogFromRepositoryRoot(githubRepositoryUrl, option) {
    return __awaiter(this, void 0, void 0, function* () {
        const [, owner, repoName] = githubRepositoryUrl.match(GITHUB_REPOSITORY_URL_REGEXP);
        return tryGithubBlobChangeLog({ owner, name: repoName }, null, option);
    });
}
function tryGithubBlobChangeLogFromRepositoryTree(githubTreeUrl, option) {
    const [, owner, repoName, pathPrefix] = githubTreeUrl.match(GITHUB_TREE_URL_REGEXP);
    return tryGithubBlobChangeLog({ owner, name: repoName }, pathPrefix, option);
}
function searchChangeLogUrl(gem, option) {
    return __awaiter(this, void 0, void 0, function* () {
        if (gem.changelogUri) {
            return gem.changelogUri;
        }
        const repositoryUrl = githubRepositoryUrl(gem);
        if (repositoryUrl) {
            const url = yield tryGithubBlobChangeLogFromRepositoryRoot(repositoryUrl, option);
            if (url) {
                return url;
            }
        }
        const treeUrl = githubTreeUrl(gem);
        if (treeUrl) {
            const url = yield tryGithubBlobChangeLogFromRepositoryTree(treeUrl, option);
            if (url) {
                return url;
            }
        }
        return null;
    });
}
exports.searchChangeLogUrl = searchChangeLogUrl;
