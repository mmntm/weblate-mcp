#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  if (process.env.MCP_TRANSPORT === 'http') {
    // Streamable HTTP transport: expose the MCP endpoint at http://<host>:<PORT>/mcp
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    const port = Number(process.env.PORT) || 3000;
    await app.listen(port, '0.0.0.0');
    return;
  }

  // Create application context for STDIO transport (no HTTP server needed)
  await NestFactory.createApplicationContext(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? false : ['error', 'warn', 'log'], // Disable all logging for MCP STDIO compatibility
  });

  // Keep the application running to handle MCP STDIO communication
  // Don't close the app as it needs to stay alive for MCP communication
}

void bootstrap();
