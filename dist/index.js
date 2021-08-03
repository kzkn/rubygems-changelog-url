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
const http = __importStar(require("http"));
function isValidUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            const req = http.request(new URL(url), res => {
                const ok = !!res.statusCode && res.statusCode >= 200 && res.statusCode < 300;
                resolve(ok);
            });
            req.end();
        });
    });
}
function isGithubRepositoryUrl(url) {
    const regexp = new RegExp('^https://github.com/[^/]+/[^/]+/?$');
    return !!url.match(regexp);
}
function isGithubTreeUrl(url) {
    const regexp = new RegExp('^https://github.com/[^/]+/[^/]+/tree/.+$');
    return !!url.match(regexp);
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
function tryGithubBlobChangeLog(baseUrls) {
    return __awaiter(this, void 0, void 0, function* () {
        const filenames = [
            'CHANGELOG.md', 'ChangeLog.md', 'Changelog.md', 'changelog.md',
            'CHANGELOG.txt', 'ChangeLog.txt', 'Changelog.txt', 'changelog.txt',
            'CHANGELOG', 'ChangeLog', 'Changelog', 'changelog',
            'HISTORY.md', 'History.md', 'History.md', 'history.md',
            'HISTORY.txt', 'History.txt', 'History.txt', 'history.txt',
            'HISTORY', 'History', 'History', 'history',
        ];
        const urls = [];
        for (const baseUrl of baseUrls) {
            for (const filename of filenames) {
                urls.push(`${baseUrl}/${filename}`);
            }
        }
        const results = yield Promise.all(urls.map(url => isValidUrl(url)));
        const idx = results.indexOf(true);
        if (idx !== -1) {
            return urls[idx];
        }
        else {
            return null;
        }
    });
}
function tryGithubBlobChangeLogFromRepositoryRoot(githubRepositoryUrl) {
    const branches = ['master', 'main'];
    const baseUrls = branches.map(branch => `${githubRepositoryUrl}/blob/${branch}`);
    return tryGithubBlobChangeLog(baseUrls);
}
function tryGithubBlobChangeLogFromRepositoryTree(githubTreeUrl) {
    const baseUrl = githubTreeUrl.replace('/tree/', '/blob/');
    return tryGithubBlobChangeLog([baseUrl]);
}
function searchChangeLogUrl(gem) {
    return __awaiter(this, void 0, void 0, function* () {
        if (gem.changelogUri) {
            if (yield isValidUrl(gem.changelogUri)) {
                return gem.changelogUri;
            }
        }
        const repositoryUrl = githubRepositoryUrl(gem);
        if (repositoryUrl) {
            const url = yield tryGithubBlobChangeLogFromRepositoryRoot(repositoryUrl);
            if (url) {
                return url;
            }
        }
        const treeUrl = githubTreeUrl(gem);
        if (treeUrl) {
            const url = yield tryGithubBlobChangeLogFromRepositoryTree(treeUrl);
            if (url) {
                return url;
            }
        }
        return null;
    });
}
exports.searchChangeLogUrl = searchChangeLogUrl;
