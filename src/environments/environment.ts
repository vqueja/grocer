// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  API_ENDPOINT: 'http://localhost:6001/',
  AppName: 'OMG!',
  FACEBOOK_APP_ID: '1858414594186264',
  FACEBOOK_SRC: '//connect.facebook.net/en_US/sdk.js',
  IMAGE_REPO: 'https://s3-ap-southeast-1.amazonaws.com/omg-eos-imagerepo/omg-images/',
  BANNER_REPO: 'https://s3-ap-southeast-1.amazonaws.com/omg-eos-imagerepo/omg-banners/',
  LOGO_REPO: 'https://s3-ap-southeast-1.amazonaws.com/omg-eos-imagerepo/store-logo/',
  PAYMAYA : {
    API: 'https://pg-sandbox.paymaya.com/checkout/',
    PUBLIC_KEY: 'cGstWjBPU3pMdkljT0kyVUl2RGhkVEdWVmZSU1NlaUdTdG5jZXF3VUU3bjBBaDo=',
  },
  S3_REPOSITORY: {
    ROOT: 'https://s3-ap-southeast-1.amazonaws.com/omg-eos-imagerepo',
    ITEMS: 'https://s3-ap-southeast-1.amazonaws.com/omg-eos-imagerepo/omg-images/',
    BANNERS: 'https://s3-ap-southeast-1.amazonaws.com/omg-eos-imagerepo/omg-banners/',
    LOGOS: 'https://s3-ap-southeast-1.amazonaws.com/omg-eos-imagerepo/store-logo/',
    CATALOGS: 'https://s3-ap-southeast-1.amazonaws.com/omg-eos-imagerepo/store-catalog/',
  },
};
