const { searchChangeLogUrl } = require('./dist/index')

describe('searchChangeLogUrl', () => {
  it('find changelog on github master branch from github repository url', async () => {
    const gem = { name: 'gretel', homepageUri: 'https://github.com/kzkn/gretel' }
    const url = await searchChangeLogUrl(gem)
    expect(url).toBe('https://github.com/kzkn/gretel/blob/master/CHANGELOG.md')
  })

  it('find changelog from gem description', async () => {
    const gem = { name: 'actioncable', changelogUri: 'https://github.com/rails/rails/blob/v6.1.4/actioncable/CHANGELOG.md' }
    const url = await searchChangeLogUrl(gem)
    expect(url).toBe('https://github.com/rails/rails/blob/v6.1.4/actioncable/CHANGELOG.md')
  })

  it('find changelog on github from github tree url', async () => {
    const gem = { name: 'actioncable', sourceCodeUri: 'https://github.com/rails/rails/tree/v6.1.4/actioncable' }
    const url = await searchChangeLogUrl(gem)
    expect(url).toBe('https://github.com/rails/rails/blob/v6.1.4/actioncable/CHANGELOG.md')
  })

  it('find changelog on github main branch from github repository url', async () => {
    const gem = { name: 'aspnet_password_hasher', homepageUri: 'https://github.com/kzkn/aspnet_password_hasher' }
    const url = await searchChangeLogUrl(gem)
    expect(url).toBe('https://github.com/kzkn/aspnet_password_hasher/blob/main/CHANGELOG.md')
  })

  it('find history.md on github master branch from github repository url', async () => {
    const gem = { name: 'puma', sourceCodeUri: 'https://github.com/puma/puma' }
    const url = await searchChangeLogUrl(gem)
    expect(url).toBe('https://github.com/puma/puma/blob/master/History.md')
  })
})
