import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { WeblateApiService } from '../services';

@Injectable()
export class WeblateLanguagesTool {
  private readonly logger = new Logger(WeblateLanguagesTool.name);

  constructor(private weblateApiService: WeblateApiService) {}

  @Tool({
    name: 'listLanguages',
    description: 'List languages available in a specific project',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project'),
    }),
  })
  async listLanguages({ projectSlug }: { projectSlug: string }) {
    try {
      const languages = await this.weblateApiService.listLanguages(projectSlug);

      return {
        content: [
          {
            type: 'text',
            text: `Languages in project "${projectSlug}":\n\n${languages
              .map(
                (l) =>
                  `- **${l.name}** (${l.code})`,
              )
              .join('\n')}`,
          },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to list languages for ${projectSlug}`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error listing languages for project "${projectSlug}": ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
} 