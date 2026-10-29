// Extiende app.json. En la web publicada la app vive en /app del sitio (ver landing/scripts/build-app.mjs).
module.exports = ({ config }) => ({
  ...config,
  experiments: { ...config.experiments, baseUrl: process.env.EXPO_WEB_BASE_URL || undefined },
});
