const app = require('./app');
const { config, validateEnv } = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/database');

let server;

async function startServer() {
  validateEnv();
  await connectDatabase();

  server = app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
}

function shutdown(signal) {
  console.log(`${signal} received. Closing HTTP server.`);

  if (!server) {
    return disconnectDatabase().finally(() => process.exit(0));
  }

  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

