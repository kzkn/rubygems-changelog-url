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
exports.getContentUrl = void 0;
const https = __importStar(require("https"));
function callApi(path, option) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const headers = {};
            headers['User-Agent'] = 'rubygems-changelog-url';
            headers['Accept'] = 'application/vnd.github.v3+json';
            if (option === null || option === void 0 ? void 0 : option.token) {
                headers['Authorization'] = `token ${option.token}`;
            }
            const opts = {
                hostname: 'api.github.com',
                port: 443,
                method: 'GET',
                path,
                headers,
            };
            const req = https.request(opts, res => {
                const { statusCode } = res;
                if (statusCode && statusCode >= 200 && statusCode < 300) {
                    let data = '';
                    res.on('data', chunk => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        resolve(data);
                    });
                }
                else {
                    reject(res);
                }
            });
            req.end();
        });
    });
}
function getContentUrl(repo, path, option) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield callApi(`/repos/${repo.owner}/${repo.name}/contents/${path}`, option);
        const obj = JSON.parse(data);
        return obj['html_url'];
    });
}
exports.getContentUrl = getContentUrl;
