const env = process.env.NODE_ENV || 'development';

if (env === 'development' || 'test') {
  /* eslint-disable-next-line */
  const config = require('./config.json');
  const envConfig = config[env];

  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}
