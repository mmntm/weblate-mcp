import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';
import {
  WeblateApiService,
  WeblateProjectsService,
  WeblateComponentsService,
  WeblateLanguagesService,
  WeblateTranslationsService,
} from './services';
import { WeblateTranslationTool } from './tools/weblate-translation.tool';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    McpModule.forRoot({
      name: process.env.MCP_SERVER_NAME || 'weblate-mcp-server',
      version: process.env.MCP_SERVER_VERSION || '1.0.0',
      transport: McpTransportType.STDIO,
      instructions: `This is a Weblate MCP server that provides tools for managing translations.
      
Available tools:
- listProjects: List all available Weblate projects
- listComponents: List components in a specific project
- listLanguages: List languages available in a specific project
- searchStringInProject: Search for translations containing specific text
- getTranslationForKey: Get translation value for a specific key
- writeTranslation: Write or update a translation value
- searchTranslationsByKey: Search for translations by key pattern
- findTranslationsForKey: Find all translations for a specific key
- listTranslationKeys: List all translation keys in a project
- searchTranslationKeys: Search for translation keys by pattern`,
    }),
  ],
  providers: [
    WeblateProjectsService,
    WeblateComponentsService,
    WeblateLanguagesService,
    WeblateTranslationsService,
    WeblateApiService,
    WeblateTranslationTool,
  ],
})
export class AppModule {}
