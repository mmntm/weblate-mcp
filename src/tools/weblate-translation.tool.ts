import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { WeblateApiService } from '../services';
import { WeblateTranslation } from '../types';

@Injectable()
export class WeblateTranslationTool {
  private readonly logger = new Logger(WeblateTranslationTool.name);

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
                  `- **${l.name}** (${l.code}) - ${l.translated_percent.toFixed(1)}% translated`,
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

  @Tool({
    name: 'searchStringInProject',
    description:
      'Search for translations containing specific text in a project',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project to search in'),
      value: z.string().describe('The text to search for'),
      searchIn: z
        .enum(['source', 'target', 'both'])
        .optional()
        .describe('Where to search: source text, target translation, or both')
        .default('both'),
    }),
  })
  async searchStringInProject({
    projectSlug,
    value,
    searchIn = 'both',
  }: {
    projectSlug: string;
    value: string;
    searchIn?: 'source' | 'target' | 'both';
  }) {
    try {
      const results = await this.weblateApiService.searchStringInProject(
        projectSlug,
        value,
        searchIn,
      );

      if (results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No translations found containing "${value}" in project "${projectSlug}"`,
            },
          ],
        };
      }

      const formattedResults = results
        .slice(0, 10)
        .map(this.formatTranslationResult)
        .join('\n\n');
      const totalText =
        results.length > 10
          ? `\n\n*Showing first 10 of ${results.length} results*`
          : '';

      return {
        content: [
          {
            type: 'text',
            text: `Found ${results.length} translations containing "${value}" in project "${projectSlug}":\n\n${formattedResults}${totalText}`,
          },
        ],
      };
    } catch (error) {
      this.logger.error(
        `Failed to search for "${value}" in ${projectSlug}`,
        error,
      );
      return {
        content: [
          {
            type: 'text',
            text: `Error searching for "${value}" in project "${projectSlug}": ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'getTranslationForKey',
    description: 'Get translation value for a specific key in a project',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project'),
      componentSlug: z.string().describe('The slug of the component'),
      languageCode: z.string().describe('The language code (e.g., en, es, fr)'),
      key: z.string().describe('The translation key to look up'),
    }),
  })
  async getTranslationForKey({
    projectSlug,
    componentSlug,
    languageCode,
    key,
  }: {
    projectSlug: string;
    componentSlug: string;
    languageCode: string;
    key: string;
  }) {
    try {
      const translation = await this.weblateApiService.getTranslationByKey(
        projectSlug,
        componentSlug,
        languageCode,
        key,
      );

      if (!translation) {
        return {
          content: [
            {
              type: 'text',
              text: `Translation not found for key "${key}" in ${projectSlug}/${componentSlug}/${languageCode}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: this.formatTranslationResult(translation),
          },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to get translation for key ${key}`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error getting translation for key "${key}": ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'writeTranslation',
    description: 'Update or write a translation value for a specific key',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project'),
      componentSlug: z.string().describe('The slug of the component'),
      languageCode: z.string().describe('The language code (e.g., en, es, fr)'),
      key: z.string().describe('The translation key to update'),
      value: z.string().describe('The new translation value'),
      markAsApproved: z
        .boolean()
        .optional()
        .describe('Whether to mark as approved (default: false)')
        .default(false),
    }),
  })
  async writeTranslation({
    projectSlug,
    componentSlug,
    languageCode,
    key,
    value,
    markAsApproved = false,
  }: {
    projectSlug: string;
    componentSlug: string;
    languageCode: string;
    key: string;
    value: string;
    markAsApproved?: boolean;
  }) {
    try {
      const updatedTranslation = await this.weblateApiService.writeTranslation(
        projectSlug,
        componentSlug,
        languageCode,
        key,
        value,
        markAsApproved,
      );

      return {
        content: [
          {
            type: 'text',
            text: `Successfully updated translation:\n\n${this.formatTranslationResult(updatedTranslation)}`,
          },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to write translation for key ${key}`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error writing translation for key "${key}": ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'searchTranslationsByKey',
    description: 'Search for translations by key pattern across components in a project',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project to search in'),
      keyPattern: z.string().describe('The key pattern to search for (supports partial matching)'),
      componentSlug: z.string().optional().describe('Optional: limit search to specific component'),
      languageCode: z.string().optional().describe('Optional: limit search to specific language'),
      exactMatch: z.boolean().optional().describe('Whether to match the key exactly (default: false)').default(false),
    }),
  })
  async searchTranslationsByKey({
    projectSlug,
    keyPattern,
    componentSlug,
    languageCode,
    exactMatch = false,
  }: {
    projectSlug: string;
    keyPattern: string;
    componentSlug?: string;
    languageCode?: string;
    exactMatch?: boolean;
  }) {
    try {
      const results = await this.weblateApiService.searchTranslationsByKey(
        projectSlug,
        keyPattern,
        componentSlug,
        languageCode,
        exactMatch,
      );

      if (results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No translations found for key pattern "${keyPattern}" in project "${projectSlug}"`,
            },
          ],
        };
      }

      const formattedResults = results
        .slice(0, 10)
        .map(this.formatTranslationResult)
        .join('\n\n');
      const totalText =
        results.length > 10
          ? `\n\n*Showing first 10 of ${results.length} results*`
          : '';

      return {
        content: [
          {
            type: 'text',
            text: `Found ${results.length} translations for key pattern "${keyPattern}" in project "${projectSlug}":\n\n${formattedResults}${totalText}`,
          },
        ],
      };
    } catch (error) {
      this.logger.error(
        `Failed to search translations by key pattern "${keyPattern}" in ${projectSlug}`,
        error,
      );
      return {
        content: [
          {
            type: 'text',
            text: `Error searching for key pattern "${keyPattern}" in project "${projectSlug}": ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'findTranslationsForKey',
    description: 'Find all translations for a specific key across all components and languages in a project',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project'),
      key: z.string().describe('The exact translation key to find'),
    }),
  })
  async findTranslationsForKey({
    projectSlug,
    key,
  }: {
    projectSlug: string;
    key: string;
  }) {
    try {
      const results = await this.weblateApiService.findTranslationsForKey(
        projectSlug,
        key,
      );

      if (results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No translations found for key "${key}" in project "${projectSlug}"`,
            },
          ],
        };
      }

      // Group by component and language for better readability
      const groupedResults = results.reduce((acc: Record<string, WeblateTranslation[]>, translation) => {
        const component = translation.translation.split('/')[2] || 'unknown';
        const language = translation.language_code;
        const groupKey = `${component}/${language}`;
        
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(translation);
        return acc;
      }, {});

      const formattedResults = Object.entries(groupedResults)
        .map(([groupKey, translations]) => {
          const [component, language] = groupKey.split('/');
          const translationList = translations.map(this.formatTranslationResult).join('\n');
          return `**${component} (${language}):**\n${translationList}`;
        })
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Found ${results.length} translations for key "${key}" in project "${projectSlug}":\n\n${formattedResults}`,
          },
        ],
      };
    } catch (error) {
      this.logger.error(
        `Failed to find translations for key "${key}" in ${projectSlug}`,
        error,
      );
      return {
        content: [
          {
            type: 'text',
            text: `Error finding translations for key "${key}" in project "${projectSlug}": ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'listTranslationKeys',
    description: 'List all translation keys in a project (optionally filtered by component)',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project'),
      componentSlug: z.string().optional().describe('Optional: filter by specific component'),
      languageCode: z.string().optional().describe('Optional: filter by specific language'),
    }),
  })
  async listTranslationKeys({
    projectSlug,
    componentSlug,
    languageCode,
  }: {
    projectSlug: string;
    componentSlug?: string;
    languageCode?: string;
  }) {
    try {
      const keys = await this.weblateApiService.listTranslationKeys(
        projectSlug,
        componentSlug,
        languageCode,
      );

      if (keys.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No translation keys found in project "${projectSlug}"`,
            },
          ],
        };
      }

      const keyList = keys.slice(0, 50).map(key => `- ${key}`).join('\n');
      const totalText = keys.length > 50
        ? `\n\n*Showing first 50 of ${keys.length} keys*`
        : '';

      return {
        content: [
          {
            type: 'text',
            text: `Found ${keys.length} translation keys in project "${projectSlug}":\n\n${keyList}${totalText}`,
          },
        ],
      };
    } catch (error) {
      this.logger.error(
        `Failed to list translation keys in ${projectSlug}`,
        error,
      );
      return {
        content: [
          {
            type: 'text',
            text: `Error listing translation keys in project "${projectSlug}": ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'searchTranslationKeys',
    description: 'Search for translation keys by pattern in a project',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project'),
      keyPattern: z.string().describe('The pattern to search for in key names (case-insensitive)'),
      componentSlug: z.string().optional().describe('Optional: limit search to specific component'),
    }),
  })
  async searchTranslationKeys({
    projectSlug,
    keyPattern,
    componentSlug,
  }: {
    projectSlug: string;
    keyPattern: string;
    componentSlug?: string;
  }) {
    try {
      const keys = await this.weblateApiService.searchTranslationKeys(
        projectSlug,
        keyPattern,
        componentSlug,
      );

      if (keys.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No translation keys found matching pattern "${keyPattern}" in project "${projectSlug}"`,
            },
          ],
        };
      }

      const keyList = keys.slice(0, 50).map(key => `- ${key}`).join('\n');
      const totalText = keys.length > 50
        ? `\n\n*Showing first 50 of ${keys.length} matching keys*`
        : '';

      return {
        content: [
          {
            type: 'text',
            text: `Found ${keys.length} translation keys matching pattern "${keyPattern}" in project "${projectSlug}":\n\n${keyList}${totalText}`,
          },
        ],
      };
    } catch (error) {
      this.logger.error(
        `Failed to search translation keys by pattern "${keyPattern}" in ${projectSlug}`,
        error,
      );
      return {
        content: [
          {
            type: 'text',
            text: `Error searching translation keys by pattern "${keyPattern}" in project "${projectSlug}": ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  private formatTranslationResult(translation: WeblateTranslation): string {
    const status = translation.approved
      ? '✅ Approved'
      : translation.translated
        ? '📝 Translated'
        : '❌ Untranslated';

    const sourceText = translation.source && Array.isArray(translation.source) 
      ? translation.source.join('') 
      : (translation.source || '(empty)');
    
    const targetText = translation.target && Array.isArray(translation.target) 
      ? translation.target.join('') 
      : (translation.target || '(empty)');

    return `**Key:** ${translation.context}
**Source:** ${sourceText}
**Target:** ${targetText}
**Status:** ${status}
**Context:** ${translation.context || '(none)'}
**Note:** ${translation.note || '(none)'}
**ID:** ${translation.id}`;
  }
}
