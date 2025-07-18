import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';
import {
  WeblateApiService,
  WeblateProjectsService,
  WeblateComponentsService,
  WeblateLanguagesService,
  WeblateTranslationsService,
  WeblateChangesService,
  WeblateStatisticsService,
} from './services';
import { WeblateClientService } from './services/weblate-client.service';
import { 
  WeblateProjectsTool,
  WeblateComponentsTool,
  WeblateLanguagesTool,
  WeblateTranslationsTool,
  WeblateChangesTool,
  WeblateStatisticsTool,
} from './tools';
import { randomUUID } from 'crypto';

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
Translation Management:
- listProjects: List all available Weblate projects
- listComponents: List components in a specific project
- listLanguages: List languages available in a specific project
- searchStringInProject: Search for translations containing specific text
- getTranslationForKey: Get translation value for a specific key
- writeTranslation: Write or update a translation value
- searchTranslationsByKey: Search for translations by key pattern
- findTranslationsForKey: Find all translations for a specific key
- listTranslationKeys: List all translation keys in a project
- searchTranslationKeys: Search for translation keys by pattern

Change Tracking & History:
- listRecentChanges: List recent changes across all projects
- getProjectChanges: Get recent changes for a specific project
- getComponentChanges: Get recent changes for a specific component
- getChangesByUser: Get recent changes by a specific user

Translation Statistics Dashboard:
- getProjectStatistics: Get comprehensive project statistics with completion rates
- getComponentStatistics: Get detailed statistics for a specific component
- getProjectDashboard: Get full dashboard overview with all component statistics
- getTranslationStatistics: Get statistics for specific translation (project/component/language)
- getComponentLanguageProgress: Get translation progress for all languages in a component
- getLanguageStatistics: Get statistics for a language across all projects
- getUserStatistics: Get contribution statistics for a specific user`,
    }),
  ],
  providers: [
    WeblateClientService,
    WeblateProjectsService,
    WeblateComponentsService,
    WeblateLanguagesService,
    WeblateTranslationsService,
    WeblateChangesService,
    WeblateApiService,
    WeblateStatisticsService,
    WeblateProjectsTool,
    WeblateComponentsTool,
    WeblateLanguagesTool,
    WeblateTranslationsTool,
    WeblateChangesTool,
    WeblateStatisticsTool,
  ],
})
export class AppModule {}
