# @webdeb/next-styles

### CSS + SASS + Modules in Next.js

---

## Description

This module allows you to use css (+ optional [sass, modules]) all in one package.
It uses the latest modules available css-loader, sass-loader, postcss. Check out the sources, its dead simple.

## Why?

Because I found it cumbersome to deal with the official packages from next-plugins to setup css + sass + modules.
So I created this one. It has everything I need for my project, most projects, I believe.

## Install

```sh
npm install @webdeb/next-styles
```

## Use

```js
// next.config.js
const withStyles = require('@webdeb/next-styles')

module.exports = withStyles({
  sass: true, // use .scss files
  modules: true, // style.(m|module).css & style.(m|module).scss for module files
  sassLoaderOptions: {
    sassOptions: {
      includePaths: ["src/styles"], // @import 'variables'; # loads (src/styles/varialbes.scss), you got it..
    },
  },
  cssLoaderOptions: {...},
  postcssLoaderOptions: {...},
  miniCssExtractOptions: {...} // ignoreOrder:true for https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250#issuecomment-544898772
})
```

_Hint: Look at the source of truth: `withStyles.js`_

## Known Issues

This project inherits a known next-css problem. https://github.com/zeit/next-plugins/issues/282

If your pages where you are importing css are not working, you are probably facing exactly this problem. The workaround is to load a css/scss file (can be even empty) into your \_app.js.

```js
import "../styles/global.scss"

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
```

## How to contribute

1. fork the project `~master`
1. locally clone the project in your machine ( `git clone https/ssh github link to your fork` )
1. create a new branch in your fork ( `git checkout -b your/branch/name` )
1. run `npm install` in your local clone of the repo
1. apply your code changes ( keep `CHANGELOG.md` and the `README.md` file up to date, also modify `package.json` `version` as fit!)
1. run `npm pack` in your local clone of the repo
1. test your changes against a next.js project that uses your local repo ( use `npm install --save path/to/local/repo/{version}.tgz` to test your locally changed code)
1. if your code work as expected, remove the packed tgz file from the repo and commit to your fork
1. create a PR to apply your fork in this repository

## Credits

Most of the code was taken from the official `next-css` & `next-sass` package.
