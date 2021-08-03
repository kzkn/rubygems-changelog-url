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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchChangeLogUrl = void 0;
const https = __importStar(require("https"));
function isValidUrl(url) {
    return new Promise((resolve) => {
        const req = https.request(new URL(url), res => {
            const ok = res.statusCode && res.statusCode >= 200 && res.statusCode < 300;
            resolve(ok ? url : null);
        });
        req.end();
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
const FILENAMES = {
    ['CHANGELOG.md']: 0,
    ['ChangeLog.md']: 0,
    ['Changelog.md']: 2,
    ['changelog.md']: 3,
    ['CHANGELOG.txt']: 2,
    ['ChangeLog.txt']: 3,
    ['Changelog.txt']: 3,
    ['changelog.txt']: 3,
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
    ['HISTORY']: 3,
    ['History']: 3,
    ['history']: 3,
    ['NEWS.md']: 1,
    ['News.md']: 2,
    ['news.md']: 3,
    ['NEWS.txt']: 3,
    ['News.txt']: 3,
    ['news.txt']: 3,
    ['NEWS']: 2,
    ['News']: 3,
    ['news']: 3,
};
const SORTED_FILENAMES = Array.from(Object.entries(FILENAMES)).sort((a, b) => a[1] - b[1]).map(e => e[0]);
function tryGithubBlobChangeLog(baseUrls) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const urls = [];
        for (const baseUrl of baseUrls) {
            for (const filename of SORTED_FILENAMES) {
                urls.push(`${baseUrl}/${filename}`);
            }
        }
        try {
            // NOTE: Deliberately looping to reduce the number of useless HTTP requests
            for (var _b = __asyncValues(urls.map(url => isValidUrl(url))), _c; _c = yield _b.next(), !_c.done;) {
                const result = _c.value;
                if (result) {
                    return result;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
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
