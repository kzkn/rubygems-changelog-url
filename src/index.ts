import * as github from './github'

export type Gem = {
  name: string
  projectUri: string | null
  homepageUri: string | null
  sourceCodeUri: string | null
  changelogUri: string | null
  licenses: string[] | null
}

const GITHUB_REPOSITORY_URL_REGEXP = new RegExp('^https://github.com/([^/]+)/([^/]+)/?$')
const GITHUB_TREE_URL_REGEXP = new RegExp('^https://github.com/([^/]+)/([^/]+)/tree/[^/]+/(.+)$')

function isGithubRepositoryUrl(url: string): boolean {
  return !!url.match(GITHUB_REPOSITORY_URL_REGEXP)
}

function isGithubTreeUrl(url: string): boolean {
  return !!url.match(GITHUB_TREE_URL_REGEXP)
}

function findUrlBy(gem: Gem, finder: (url: string) => boolean): string | null {
  const { projectUri, homepageUri, sourceCodeUri } = gem
  return [projectUri, homepageUri, sourceCodeUri].find(uri => uri && finder(uri)) || null
}

function githubRepositoryUrl(gem: Gem): string | null {
  return findUrlBy(gem, isGithubRepositoryUrl)
}

function githubTreeUrl(gem: Gem): string | null {
  return findUrlBy(gem, isGithubTreeUrl)
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
  ['Releases']: 2,
}

const SORTED_FILENAMES = Array.from(Object.entries(FILENAMES)).sort((a, b) => a[1] - b[1]).map(e => e[0])

async function tryGithubBlobChangeLog(repo: github.Repository, pathPrefix: string | null, option?: github.Option): Promise<string | null> {
  const defaultBranch = await github.getDefaultBranch(repo, option)
  const entries = await github.getDirectoryEntries(repo, { branch: defaultBranch, path: pathPrefix }, option)
  const entryMap = new Map()
  entries.forEach(entry => entryMap.set(entry.path, entry))

  for (const path of SORTED_FILENAMES) {
    const entry = entryMap.get(path)
    if (entry?.type === 'blob') {
      const fullPath = [pathPrefix, path].filter(Boolean).join('/')
      return `https://github.com/${repo.owner}/${repo.name}/blob/${defaultBranch}/${fullPath}`
    }
  }

  return null
}

async function tryGithubBlobChangeLogFromRepositoryRoot(githubRepositoryUrl: string, option?: github.Option): Promise<string | null> {
  const [, owner, repoName] = githubRepositoryUrl.match(GITHUB_REPOSITORY_URL_REGEXP) as string[]
  return tryGithubBlobChangeLog({ owner, name: repoName }, null, option)
}

function tryGithubBlobChangeLogFromRepositoryTree(githubTreeUrl: string, option?: github.Option): Promise<string | null> {
  const [, owner, repoName, pathPrefix] = githubTreeUrl.match(GITHUB_TREE_URL_REGEXP) as string[]
  return tryGithubBlobChangeLog({ owner, name: repoName }, pathPrefix, option)
}

type Option = github.Option
export async function searchChangeLogUrl(gem: Gem, option?: Option): Promise<string | null> {
  if (gem.changelogUri) {
    return gem.changelogUri
  }

  const repositoryUrl = githubRepositoryUrl(gem)
  if (repositoryUrl) {
    const url = await tryGithubBlobChangeLogFromRepositoryRoot(repositoryUrl, option)
    if (url) {
      return url
    }
  }

  const treeUrl = githubTreeUrl(gem)
  if (treeUrl) {
    const url = await tryGithubBlobChangeLogFromRepositoryTree(treeUrl, option)
    if (url) {
      return url
    }
  }

  return null
}
