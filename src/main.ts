import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create application context for STDIO transport (no HTTP server needed)
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false, // Disable all logging for MCP STDIO compatibility
  });
  
  // Keep the application running to handle MCP STDIO communication
  // Don't close the app as it needs to stay alive for MCP communication
}

void bootstrap();
