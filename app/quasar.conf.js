// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js
const fs = require('fs')
const { configure } = require('quasar/wrappers')
const ESLintPlugin = require('eslint-webpack-plugin')
const IgnorePlugin = require("webpack").IgnorePlugin
const {config} = require('dotenv')

// This is for development purposes only. It will load the .env file and make it available
// so the process.env.ENV_VAR will be replaced at build time. For production, the environment
// variables should be set in the server environment and are replaced via a bash script at
// /docker/replace_env_vars.sh at application start time.
const environment = config().parsed
console.info("Environment:", environment)

const StatoscopeWebpackPlugin = require('@statoscope/webpack-plugin').default;

module.exports = configure(function(ctx) {
  return {
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://quasar.dev/quasar-cli/cli-documentation/boot-files
    boot: [
      "errors",
      "i18n",
      "auth",
      "gtm",
      ...(environment.MOCK_ENABLE === "true" ? ["mirage"]: [])
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: ["app.sass"],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v4',
      // 'fontawesome-v5',
      // 'eva-icons',
      // 'themify',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      "roboto-font", // optional, you are not bound to it
      "material-icons" // optional, you are not bound to it
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      iconSet: "material-icons", // Quasar icon set
      lang: "en-US", // Quasar language pack

      // Possible values for "all":
      // * 'auto' - Auto-import needed Quasar components & directives
      //            (slightly higher compile time; next to minimum bundle size; most convenient)
      // * false  - Manually specify what to import
      //            (fastest compile time; minimum bundle size; most tedious)
      // * true   - Import everything from Quasar
      //            (not treeshaking Quasar; biggest bundle size; convenient)
      importStrategy: "auto",

      components: [],
      directives: [],

      // Quasar plugins
      plugins: ["Notify", "LocalStorage", "Loading"],
      config: {
        notify: {
          /* Notify defaults */
        }
      }
    },

    supportTS: {
      tsCheckerConfig: {
        eslint: {
          enabled: true,
          files: './src/**/*.{ts,tsx,js,jsx,vue}'
        }
      }
    },

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      transpile: false,
      scopeHoisting: true,
      vueRouterMode: "history", // available values: 'hash', 'history'
      showProgress: true,
      gzip: false,
      analyze: false,
      // Options below are automatically set depending on the env, set them if you want to override
      // preloadChunks: false,
      // extractCSS: false,

      // https://quasar.dev/quasar-cli/cli-documentation/handling-webpack
      extendWebpack(cfg) {},
      // Create complete source maps to enable debugging from VSCode.
      // https://quasar.dev/start/vs-code-configuration#Debugging-a-Quasar-project-in-VS-Code
      devtool: "source-map",
      chainWebpack (chain) {
        chain
          .plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['ts', 'vue'] }])
        // Ignore "leaflet" import since both we and the vue-leaflet module are using the 
        // leaflet.esm.js file, but in one place vue-leaflet conditionally loads "leaflet"
        // and we would end up with duplicated library (hence innecessarily bloating bundle 
        // size).
        chain
          .plugin('webpack-ignore-plugin')
          .use(IgnorePlugin, [{ resourceRegExp: /^leaflet$/}])
        
        
        chain
          .plugin('statoscope-webpack-plugin')
          .use(StatoscopeWebpackPlugin, [{saveReportTo: "statoscope-report-[name]-[hash].html"}])
        

      },
      // Pass the current .env file to the build process in dev mode,
      // but don't pass it in production mode.
      env: ctx.dev ? environment : undefined
    },

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    // Only define the dev server when on dev mode, since otherwise we don't need to configure 
    // local certificates.
    devServer: ctx.dev ? {
      host: "localhost",
      port: 2030,
      open: true,
      https: {
        key: fs.readFileSync("./tmp/certs/localhost-key.pem"),
        cert: fs.readFileSync("./tmp/certs/localhost.pem"),
        ca: fs.readFileSync(process.env.LOCAL_CA_ROOT)
      }
    } : {},

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: [
      "fadeInDown",
      "fadeOutUp"
    ],

    // https://quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      pwa: false
    },

    // https://quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: 'InjectManifest',//"InjectManifest", // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {
        maximumFileSizeToCacheInBytes: 4*1024*1024 //4MB
      }, // only for GenerateSW
      manifest: {
        name: "Komunitin",
        short_name: "Komunitin",
        description: "Open System for Exchange Communities",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#98c725",
        icons: [
          {
            src: "icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png"
          },
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icons/icon-256x256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png"
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
      id: "org.komunitin.mobile.app"
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      bundler: "packager", // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: "komunitin"
      },

      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: true,

      extendWebpack(cfg) {
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack
        cfg.module.rules.push({
          enforce: "pre",
          test: /\.(js|vue)$/,
          loader: "eslint-loader",
          exclude: /[\\/]node_modules[\\/]/,
          options: {
            formatter: require("eslint").CLIEngine.getFormatter("stylish")
          }
        });
      }
    }
  };
});
