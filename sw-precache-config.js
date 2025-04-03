module.exports = {
  staticFileGlobs: [
    'dist/**.html',
    'dist/**.js',
    'dist/**.css',
    'dist/assets/*',
    'dist/*.eot',
    'dist/*.woff2',
    'dist/*.ttf',
    'dist/*.woff',        
    'dist/*.svg',
    'dist/*.gif',    
  ],
  root: 'dist',
  stripPrefix: 'dist/',
  navigateFallback: '/index.html',
  runtimeCaching: [{
    urlPattern: /s3-ap-southeast-1\.amazonaws\.com\/omg-eos-imagerepo/,
    handler: 'cacheFirst',
    options: {
      cache: {
        name: 'omg-s3',
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }
    }
  }, {
    urlPattern: /api\.omg-mordor\.com\/v1/,
    handler: 'networkFirst',
    options: {
      cache: {
        name: 'omg-api',
        maxEntries: 20,
        maxAgeSeconds: 60 * 5,
      }
    }
  }, {
    urlPattern: /api\.ohmygrocery\.com\/v1/,
    handler: 'networkFirst',
    options: {
      cache: {
        name: 'omg-api',
        maxEntries: 20,
        maxAgeSeconds: 60 * 5,
      }
    }
  }]
};
