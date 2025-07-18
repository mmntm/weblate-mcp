import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { WeblateApiService } from '../services';

@Injectable()
export class WeblateProjectsTool {
  private readonly logger = new Logger(WeblateProjectsTool.name);

  constructor(private weblateApiService: WeblateApiService) {}

  @Tool({
    name: 'listProjects',
    description: 'List all available Weblate projects',
    parameters: z.object({}),
  })
  async listProjects() {
    try {
      const projects = await this.weblateApiService.listProjects();

      return {
        content: [
          {
            type: 'text',
            text: `Found ${projects.length} projects:\n\n${projects
              .map((p) => `- **${p.name}** (${p.slug})\n  URL: ${p.web_url}`)
              .join('\n\n')}`,
          },
        ],
      };
    } catch (error) {
      this.logger.error('Failed to list projects', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error listing projects: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
} 