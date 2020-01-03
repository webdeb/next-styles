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
npm i @webdeb/next-styles
```

## Use

```js
// next.config.js
const withStyles = require('@webdeb/next-styles')

module.exports = withStyles({
  sass: true, // use .scss files
  modules: true, // style.m.css & style.m.scss for module files
  sassLoaderOptions: {
    sassOptions: {
      includePaths: ["src/styles"], // @import 'variables'; # loads (src/styles/varialbes.scss), you got it..
    },
  },
  postcssLoaderOptions: {...}
})
```

_Hint: Look at the source of truth: `withStyles.js`_

## Credits

Most of the code was taken from official `next-css` / `next-sass` packages, so thanks MIT Community!

