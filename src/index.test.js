const { searchChangeLogUrl } = require('../dist/index')

const option = { token: process.env.GITHUB_TOKEN }

describe('searchChangeLogUrl', () => {
  it('find changelog on github main branch from github repository url', async () => {
    const gem = { name: 'gretel', homepageUri: 'https://github.com/kzkn/gretel' }
    const url = await searchChangeLogUrl(gem, option)
    expect(url).toBe('https://github.com/kzkn/gretel/blob/main/CHANGELOG.md')
  })

  it('find changelog from gem description', async () => {
    const gem = { name: 'actioncable', changelogUri: 'https://github.com/rails/rails/blob/v6.1.4/actioncable/CHANGELOG.md' }
    const url = await searchChangeLogUrl(gem, option)
    expect(url).toBe('https://github.com/rails/rails/blob/v6.1.4/actioncable/CHANGELOG.md')
  })

  it('find changelog on github from github tree url', async () => {
    const gem = { name: 'actioncable', sourceCodeUri: 'https://github.com/rails/rails/tree/v6.1.4/actioncable' }
    const url = await searchChangeLogUrl(gem, option)
    expect(url).toBe('https://github.com/rails/rails/blob/main/actioncable/CHANGELOG.md')
  })

  it('find changelog on github main branch from github repository url', async () => {
    const gem = { name: 'aspnet_password_hasher', homepageUri: 'https://github.com/kzkn/aspnet_password_hasher' }
    const url = await searchChangeLogUrl(gem, option)
    expect(url).toBe('https://github.com/kzkn/aspnet_password_hasher/blob/main/CHANGELOG.md')
  })

  it('find History.md on github main branch from github repository url', async () => {
    const gem = { name: 'puma', sourceCodeUri: 'https://github.com/puma/puma' }
    const url = await searchChangeLogUrl(gem, option)
    expect(url).toBe('https://github.com/puma/puma/blob/main/History.md')
  })

  it('find NEWS.md on github main branch from github repository url', async () => {
    const gem = { name: 'csv', homepageUri: 'https://github.com/ruby/csv' }
    const url = await searchChangeLogUrl(gem, option)
    expect(url).toBe('https://github.com/ruby/csv/blob/main/NEWS.md')
  })

  it('find History.rdoc on github main branch from github repository url', async () => {
    const gem = { name: 'dummy-for-test-history-rdoc', homepageUri: 'https://github.com/kzkn/dummy-for-test-history-rdoc' }
    const url = await searchChangeLogUrl(gem, option)
    expect(url).toBe('https://github.com/kzkn/dummy-for-test-history-rdoc/blob/main/History.rdoc')
  })

  it('find Releases on github master branch from github repository url', async () => {
    const gem = { name: 'daemons', homepageUri: 'https://github.com/thuehlinger/daemons' }
    const url = await searchChangeLogUrl(gem, option)
    expect(url).toBe('https://github.com/thuehlinger/daemons/blob/master/Releases')
  })
})
