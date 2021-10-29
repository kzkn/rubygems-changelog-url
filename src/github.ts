import * as https from 'https'

export type Repository = {
  owner: string
  name: string
}

export type Option = {
  token?: string
}

export type GithubFileEntry = {
  path: string
  mode: string
  type: 'blob' | 'tree'
  size: number
  sha: string
  url: string
}

async function callApi(path: string, option?: Option): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const headers: { [key: string]: string } = {}
    headers['User-Agent'] = 'rubygems-changelog-url'
    headers['Accept'] = 'application/vnd.github.v3+json'
    if (option?.token) {
      headers['Authorization'] = `token ${option.token}`
    }

    const opts = {
      hostname: 'api.github.com',
      port: 443,
      method: 'GET',
      path,
      headers,
    }

    const req = https.request(opts, res => {
      const { statusCode } = res
      if (statusCode && statusCode >= 200 && statusCode < 300) {
        let data = ''
        res.on('data', chunk => {
          data += chunk
        })
        res.on('end', () => {
          resolve(data)
        })
      } else {
        reject(res)
      }
    })

    req.end()
  })
}

export async function getContentUrl(repo: Repository, path: string, option?: Option): Promise<string> {
  const data = await callApi(`/repos/${repo.owner}/${repo.name}/contents/${path}`, option)
  const obj = JSON.parse(data)
  return obj['html_url']
}

export async function getDefaultBranch(repo: Repository, option?: Option): Promise<string> {
  const data = await callApi(`/repos/${repo.owner}/${repo.name}`, option)
  const obj = JSON.parse(data)
  return obj['default_branch']
}

export async function getDirectoryEntries(repo: Repository, params: { branch: string, path: string | null }, option?: Option): Promise<GithubFileEntry[]> {
  const treePath = params.path ? `${params.branch}:${params.path}` : params.branch;
  const apiPath = `/repos/${repo.owner}/${repo.name}/git/trees/${treePath}`
  const data = await callApi(apiPath, option)
  const obj = JSON.parse(data)
  return obj.tree as GithubFileEntry[]
}
