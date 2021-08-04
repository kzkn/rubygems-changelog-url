import * as https from 'https'

export type Repository = {
  owner: string
  name: string
}

export type Option = {
  token?: string
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
