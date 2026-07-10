const appJson = require('./app.json');

// Static config stays in app.json; this dynamic wrapper only exists to bridge
// FRED_API_KEY from .env (or EAS secrets in CI/build) into the client bundle
// via expo-constants, since it isn't EXPO_PUBLIC_-prefixed (Metro would inline
// that automatically, but this key is read explicitly and never logged).
module.exports = () => ({
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    fredApiKey: process.env.FRED_API_KEY ?? '',
  },
});
