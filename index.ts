import * as http from 'http'

export type Gem = {
  name: string
  projectUri: string | null
  homepageUri: string | null
  sourceCodeUri: string | null
  changelogUri: string | null
}

async function isValidUrl(url: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const req = http.request(new URL(url), res => {
      const ok = !!res.statusCode && res.statusCode >= 200 && res.statusCode < 300
      resolve(ok)
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

async function tryGithubBlobChangeLog(baseUrls: string[]): Promise<string | null> {
  const filenames = [
    'CHANGELOG.md', 'ChangeLog.md', 'Changelog.md', 'changelog.md',
    'CHANGELOG.txt', 'ChangeLog.txt', 'Changelog.txt', 'changelog.txt',
    'CHANGELOG', 'ChangeLog', 'Changelog', 'changelog',
    'HISTORY.md', 'History.md', 'History.md', 'history.md',
    'HISTORY.txt', 'History.txt', 'History.txt', 'history.txt',
    'HISTORY', 'History', 'History', 'history',
  ]
  const urls = []
  for (const baseUrl of baseUrls) {
    for (const filename of filenames) {
      urls.push(`${baseUrl}/${filename}`)
    }
  }

  const results = await Promise.all(urls.map(url => isValidUrl(url)))
  const idx = results.indexOf(true)
  if (idx !== -1) {
    return urls[idx]
  } else {
    return null
  }
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
