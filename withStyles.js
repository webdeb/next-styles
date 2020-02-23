const findUp = require("find-up")
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin")

module.exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      if (!options.defaultLoaders) {
        throw new Error(
          "This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade"
        )
      }

      const { dev, isServer } = options
      const {
        sass,
        modules,
        sassLoaderOptions,
        cssLoaderOptions,
        postcssLoaderOptions,
      } = nextConfig

      const issuer = issuer => {
        if (issuer.match(/pages[\\/]_document\.js$/)) {
          throw new Error(
            "You can not import CSS/SASS/SCSS files in pages/_document.js, use pages/_app.js instead."
          )
        }
        return true
      }

      const cssModules =
        typeof modules === "object"
          ? modules
          : !!modules && {
              localIdentName: dev ? "[path][name]__[local]" : "[hash:base64:8]",
            }

      options.defaultLoaders.css = getStyleLoaders(config, {
        extensions: ["css"],
        cssLoaderOptions,
        postcssLoaderOptions,
        dev,
        isServer,
      })
      config.module.rules.push({
        issuer,
        test: /\.css$/,
        exclude: /\.(m|module)\.css$/,
        use: options.defaultLoaders.css,
      })

      if (cssModules) {
        options.defaultLoaders.cssModules = getStyleLoaders(config, {
          extensions: ["css"],
          cssModules,
          cssLoaderOptions,
          postcssLoaderOptions,
          dev,
          isServer,
        })
        config.module.rules.push({
          issuer,
          test: /\.(m|module)\.css$/,
          use: options.defaultLoaders.cssModules,
        })
      }

      const sassLoader = {
        loader: "sass-loader",
        options: sassLoaderOptions,
      }

      if (sass) {
        options.defaultLoaders.sass = getStyleLoaders(config, {
          extensions: ["scss", "sass"],
          loaders: [sassLoader],
          cssLoaderOptions,
          postcssLoaderOptions,
          dev,
          isServer,
        })
        config.module.rules.push({
          issuer,
          test: /\.s[ac]ss$/,
          exclude: /\.(m|module)\.s[ac]ss$/,
          use: options.defaultLoaders.sass,
        })
      }

      if (sass && cssModules) {
        options.defaultLoaders.sassModules = getStyleLoaders(config, {
          extensions: ["scss", "sass"],
          loaders: [sassLoader],
          cssModules,
          cssLoaderOptions,
          postcssLoaderOptions,
          dev,
          isServer,
        })
        config.module.rules.push({
          issuer,
          test: /\.(m|module)\.s[ac]ss$/,
          use: options.defaultLoaders.sassModules,
        })
      }

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options)
      }

      return config
    },
  })
}

const fileExtensions = new Set()
let extractCssInitialized = false

const getStyleLoaders = (
  config,
  {
    dev,
    isServer,
    cssModules,
    extensions = [],
    postcssLoaderOptions = {},
    cssLoaderOptions,
    loaders = [],
  }
) => {
  // We have to keep a list of extensions for the splitchunk config
  for (const extension of extensions) {
    fileExtensions.add(extension)
  }

  if (!isServer) {
    config.optimization.splitChunks.cacheGroups.styles = {
      name: "styles",
      test: new RegExp(`\\.+(${[...fileExtensions].join("|")})$`),
      chunks: "all",
      enforce: true,
    }
  }

  if (!isServer && !extractCssInitialized) {
    config.plugins.push(
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: dev
          ? "static/chunks/[name].css"
          : "static/chunks/[name].[contenthash:8].css",
        chunkFilename: dev
          ? "static/chunks/[name].chunk.css"
          : "static/chunks/[name].[contenthash:8].chunk.css",
        hot: dev,
      })
    )
    extractCssInitialized = true
  }

  if (!dev) {
    if (!Array.isArray(config.optimization.minimizer)) {
      config.optimization.minimizer = []
    }

    config.optimization.minimizer.push(
      new OptimizeCssAssetsWebpackPlugin({
        cssProcessorOptions: {
          discardComments: { removeAll: true },
        },
      })
    )
  }

  const postcssLoader = getPostcssLoader(config, postcssLoaderOptions)

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: dev,
      importLoaders: loaders.length + (postcssLoader ? 1 : 0),
      onlyLocals: isServer,
      modules: cssModules,
      ...cssLoaderOptions,
    },
  }

  // When not using css modules we don't transpile on the server
  if (isServer && !cssLoader.options.modules) {
    return ["ignore-loader"]
  }

  // When on the server and using css modules we transpile the css
  if (isServer && cssLoader.options.modules) {
    return [cssLoader, postcssLoader, ...loaders].filter(Boolean)
  }

  return [
    !isServer && dev && 'extracted-loader',
    !isServer && MiniCssExtractPlugin.loader,
    cssLoader,
    postcssLoader,
    ...loaders,
  ].filter(Boolean)
}

function getPostcssLoader(config, postcssLoaderOptions) {
  const postcssConfigPath = findUp.sync("postcss.config.js", {
    cwd: config.context,
  })
  if (postcssConfigPath) {
    // Copy the postcss-loader config options first.
    const postcssOptionsConfig = Object.assign(
      {},
      postcssLoaderOptions.config,
      { path: postcssConfigPath }
    )
    return {
      loader: "postcss-loader",
      options: Object.assign({}, postcssLoaderOptions, {
        config: postcssOptionsConfig,
      }),
    }
  }

  return null
}
