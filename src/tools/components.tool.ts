import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { WeblateApiService } from '../services';

@Injectable()
export class WeblateComponentsTool {
  private readonly logger = new Logger(WeblateComponentsTool.name);

  constructor(private weblateApiService: WeblateApiService) {}

  @Tool({
    name: 'listComponents',
    description: 'List components in a specific project',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project'),
    }),
  })
  async listComponents({ projectSlug }: { projectSlug: string }) {
    try {
      const components =
        await this.weblateApiService.listComponents(projectSlug);

      return {
        content: [
          {
            type: 'text',
            text: `Components in project "${projectSlug}":\n\n${components
              .map(
                (c) =>
                  `- **${c.name}** (${c.slug})\n  Source Language: ${c.source_language.name} (${c.source_language.code})`,
              )
              .join('\n\n')}`,
          },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to list components for ${projectSlug}`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error listing components for project "${projectSlug}": ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
} 