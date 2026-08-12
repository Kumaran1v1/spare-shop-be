import app from './app';
import { connectDB } from './config/database';
import { env } from './config/env';

const startServer = async () => {
  await connectDB();

  const PORT = parseInt(env.PORT, 10) || 5000;

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🚀 Backend API Server running on 0.0.0.0:${PORT} [${env.NODE_ENV}]
👉 Health Check: http://localhost:${PORT}/api/health
    `);
  });

  const handleShutdown = (signal: string) => {
    console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('🛑 Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();
