import path from 'path'

const config = {
  projectName: 'howtocook-app',
  date: '2025-11-2',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    375: 2,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-html'],
  defineConstants: {
  },
  copy: {
    patterns: [
    ],
    options: {
    }
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false
    }
  },
  cache: {
    enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
  },
  alias: {
    '@': path.resolve(__dirname, '..', 'src')
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {

        }
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    router: {
      mode: 'hash'
    },
    output: {
      filename: 'js/[name].[hash:8].js',
      chunkFilename: 'js/[name].[chunkhash:8].js'
    },
    miniCssExtractPluginOption: {
      ignoreOrder: true,
      filename: 'css/[name].[hash].css',
      chunkFilename: 'css/[name].[chunkhash].css'
    },
    htmlPluginOption: {
      template: path.resolve(__dirname, '..', 'src/index.html')
    },
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    // 自定义 Webpack 配置
    webpackChain(chain) {
      chain.merge({
        optimization: {
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
              common: {
                name: 'common',
                minChunks: 2,
                priority: 1
              },
              vendors: {
                name: 'vendors',
                minChunks: 2,
                test: /[\\/]node_modules[\\/]/,
                priority: 10
              },
              taro: {
                name: 'taro',
                test: /[\\/]node_modules[\\/]@tarojs[\\/]/,
                priority: 100
              }
            }
          }
        },
        ignoreWarnings: [
          {
            module: /taro-video-core\.js/,
            message: /webpackExports/
          }
        ]
      })
    }
  },
  rn: {
    appName: 'HowToCook',
    output: {
      iosSourceMapUrl: '',
      iosSourcemapOutput: '../taro-native-shell/ios/main.map',
      iosSourcemapSourcesRoot: '',
      androidSourceMapUrl: '',
      androidSourcemapOutput: '../taro-native-shell/android/app/src/main/assets/index.android.map',
      androidSourcemapSourcesRoot: ''
    },
    postcss: {
      cssModules: {
        enable: false
      }
    }
  }
}

export default function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
