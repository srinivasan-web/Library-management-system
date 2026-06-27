const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'src', '.env'),
];

envPaths.forEach((envPath) => {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false, quiet: true });
  }
});

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || 'development-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  defaultBorrowLimit: Number(process.env.DEFAULT_BORROW_LIMIT) || 5,
  dailyFineRate: Number(process.env.DAILY_FINE_RATE) || 5,
};

config.isProduction = config.env === 'production';

function validateEnv() {
  if (!config.mongoUri) {
    throw new Error('MONGODB_URI is required to start the API.');
  }

  if (config.isProduction && config.jwtSecret === 'development-only-secret-change-me') {
    throw new Error('JWT_SECRET must be set to a strong secret in production.');
  }
}

module.exports = {
  config,
  validateEnv,
};
