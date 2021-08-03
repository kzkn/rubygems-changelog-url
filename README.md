# rubygems-changelog-url

Search for the URL of ChangeLog in RubyGems.

## Installation

```
yarn add rubygems-changelog-url
```

## Usage

```js
import { searchChangeLogUrl } from 'rubygems-changelog-url'

const gem = {
  name: 'csv',
  homepageUri: 'https://github.com/ruby/csv'
}
await searchChangeLogUrl(gem) // => https://github.com/ruby/csv/blob/master/NEWS.md
```
