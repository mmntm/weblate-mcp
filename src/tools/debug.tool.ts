import { Injectable } from '@nestjs/common';
import { WeblateApiService } from '../services/weblate-api.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DebugTool {
  constructor(
    private weblateApiService: WeblateApiService,
    private configService: ConfigService,
  ) {}

  async debugConfiguration() {
    const apiUrl = this.configService.get<string>('WEBLATE_API_URL');
    const apiToken = this.configService.get<string>('WEBLATE_API_TOKEN');

    return {
      api_url: apiUrl,
      token_configured: !!apiToken,
      token_length: apiToken?.length || 0,
      token_prefix: apiToken?.substring(0, 10) + '...',
      debug_mode: this.configService.get<string>('DEBUG') === 'true',
    };
  }

  async testApiConnection() {
    try {
      // Test by calling listProjects
      const projects = await this.weblateApiService.listProjects();
      return {
        status: 'success',
        message: `API connection working - found ${projects.length} projects`,
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  async debugListProjects() {
    try {
      const projects = await this.weblateApiService.listProjects();
      return {
        success: true,
        project_count: projects.length,
        projects: projects.map((p) => ({ slug: p.slug, name: p.name })),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }
}
