import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { WeblateApiService } from '../services';
import { type Unit } from '../client';

@Injectable()
export class WeblateTranslationsTool {
  private readonly logger = new Logger(WeblateTranslationsTool.name);

  constructor(private weblateApiService: WeblateApiService) {}

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
      const updatedUnit = await this.weblateApiService.writeTranslation(
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
            text: updatedUnit 
              ? `Successfully updated translation for key "${key}"\n\n${this.formatTranslationResult(updatedUnit)}`
              : `Failed to update translation for key "${key}"`,
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
      const groupedResults = results.reduce((acc: Record<string, Unit[]>, translation) => {
        const component = translation.web_url?.split('/')[4] || 'unknown';
        const language = translation.web_url?.split('/')[6] || 'unknown';
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
    name: 'searchUnitsWithFilters',
    description: 'Search translation units using Weblate\'s powerful filtering syntax. Supports filters like: state:<translated (untranslated), state:>=translated (translated), component:NAME, source:TEXT, target:TEXT, has:suggestion, etc.',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project'),
      componentSlug: z.string().describe('The slug of the component'),
      languageCode: z.string().describe('The language code (e.g., sk, cs, fr)'),
      searchQuery: z.string().describe('Weblate search query using their filter syntax. Examples: "state:<translated" (untranslated), "state:>=translated" (translated), "source:hello", "has:suggestion", "component:common AND state:<translated"'),
      limit: z.number().optional().default(50).describe('Maximum number of results to return (default: 50, max: 200)'),
    }),
  })
  async searchUnitsWithFilters({
    projectSlug,
    componentSlug,
    languageCode,
    searchQuery,
    limit = 50,
  }: {
    projectSlug: string;
    componentSlug: string;
    languageCode: string;
    searchQuery: string;
    limit?: number;
  }) {
    try {
      const results = await this.weblateApiService.searchUnitsWithQuery(
        projectSlug,
        componentSlug,
        languageCode,
        searchQuery,
        Math.min(limit, 200), // Cap at 200 to prevent overwhelming responses
      );

      if (results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No units found matching query "${searchQuery}" in ${projectSlug}/${componentSlug}/${languageCode}`,
            },
          ],
        };
      }

      const resultText = this.formatFilteredResults(results, projectSlug, componentSlug, languageCode, searchQuery);
      
      return {
        content: [
          {
            type: 'text',
            text: resultText,
          },
        ],
      };
    } catch (error) {
      this.logger.error('Failed to search units with filters', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error searching units: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  private formatTranslationResult(translation: Unit): string {
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

  private formatFilteredResults(results: Unit[], projectSlug: string, componentSlug: string, languageCode: string, searchQuery: string): string {
    if (results.length === 0) {
      return `No units found in ${projectSlug}/${componentSlug}/${languageCode} matching query: ${searchQuery}`;
    }

    const formattedResults = results
      .slice(0, 50) // Limit to 50 for readability
      .map(unit => {
        const sourceText = unit.source && Array.isArray(unit.source) 
          ? unit.source.join('') 
          : (unit.source || '(empty)');
        const targetText = unit.target && Array.isArray(unit.target) 
          ? unit.target.join('') 
          : (unit.target || '(empty)');

        // Determine status based on state
        let status = '❓ Unknown';
        if (unit.state === 0) status = '❌ Untranslated';
        else if (unit.state === 10) status = '🔄 Needs Editing';
        else if (unit.state === 20) status = '✅ Translated';
        else if (unit.state === 30) status = '✅ Approved';
        else if (unit.state === 100) status = '🔒 Read-only';

        return `**Key:** ${unit.context || '(no context)'}
**Source:** ${sourceText}
**Target:** ${targetText}
**Status:** ${status}
**Location:** ${unit.location || '(none)'}
**Note:** ${unit.note || '(none)'}
**ID:** ${unit.id}`;
      })
      .join('\n\n');

    const totalText = results.length > 50
      ? `\n\n*Showing first 50 of ${results.length} units*`
      : '';

    return `Found ${results.length} units in ${projectSlug}/${componentSlug}/${languageCode} matching query "${searchQuery}":\n\n${formattedResults}${totalText}`;
  }
} 