import * as https from 'https'

export type Gem = {
  name: string
  projectUri: string | null
  homepageUri: string | null
  sourceCodeUri: string | null
  changelogUri: string | null
}

function isValidUrl(url: string): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    const req = https.request(new URL(url), res => {
      const ok = res.statusCode && res.statusCode >= 200 && res.statusCode < 300
      resolve(ok ? url : null)
    })

    req.end()
  })
}

function isGithubRepositoryUrl(url: string): boolean {
  const regexp = new RegExp('^https://github.com/[^/]+/[^/]+/?$')
  return !!url.match(regexp)
}

function isGithubTreeUrl(url: string): boolean {
  const regexp = new RegExp('^https://github.com/[^/]+/[^/]+/tree/.+$')
  return !!url.match(regexp)
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
}

const SORTED_FILENAMES = Array.from(Object.entries(FILENAMES)).sort((a, b) => a[1] - b[1]).map(e => e[0])

async function tryGithubBlobChangeLog(baseUrls: string[]): Promise<string | null> {
  const urls = []
  for (const baseUrl of baseUrls) {
    for (const filename of SORTED_FILENAMES) {
      urls.push(`${baseUrl}/${filename}`)
    }
  }

  // NOTE: Deliberately looping to reduce the number of useless HTTP requests
  for await (const result of urls.map(url => isValidUrl(url))) {
    if (result) {
      return result
    }
  }
  return null
}

function tryGithubBlobChangeLogFromRepositoryRoot(githubRepositoryUrl: string): Promise<string | null> {
  const branches = ['master', 'main']
  const baseUrls = branches.map(branch => `${githubRepositoryUrl}/blob/${branch}`)
  return tryGithubBlobChangeLog(baseUrls)
}

function tryGithubBlobChangeLogFromRepositoryTree(githubTreeUrl: string): Promise<string | null> {
  const baseUrl = githubTreeUrl.replace('/tree/', '/blob/')
  return tryGithubBlobChangeLog([baseUrl])
}

export async function searchChangeLogUrl(gem: Gem): Promise<string | null> {
  if (gem.changelogUri) {
    if (await isValidUrl(gem.changelogUri)) {
      return gem.changelogUri
    }
  }

  const repositoryUrl = githubRepositoryUrl(gem)
  if (repositoryUrl) {
    const url = await tryGithubBlobChangeLogFromRepositoryRoot(repositoryUrl)
    if (url) {
      return url
    }
  }

  const treeUrl = githubTreeUrl(gem)
  if (treeUrl) {
    const url = await tryGithubBlobChangeLogFromRepositoryTree(treeUrl)
    if (url) {
      return url
    }
  }

  return null
}
