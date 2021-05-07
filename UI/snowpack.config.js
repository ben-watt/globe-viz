/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  env: {
    SERVER_HOST: 'localhost',
    SERVER_PORT: '5000',
  },
  plugins: {
    optimize: {
      bundle: true,
      minify: true,
      target: 'es2018',
    },
  },
  mount: {
    public: {url: '/', static: true},
    src: {url: '/dist'},
  },
  plugins: [
    '@snowpack/plugin-postcss',
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-typescript',
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true,
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
