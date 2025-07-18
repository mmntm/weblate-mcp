import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { WeblateApiService } from '../services';
import { WeblateStatisticsService } from '../services/weblate/statistics.service';

@Injectable()
export class WeblateStatisticsTool {
  private readonly logger = new Logger(WeblateStatisticsTool.name);

  constructor(
    private apiService: WeblateApiService,
    private statisticsService: WeblateStatisticsService,
  ) {}

  @Tool({
    name: 'getProjectStatistics',
    description: 'Get comprehensive statistics for a project including completion rates and string counts',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project'),
    }),
  })
  async getProjectStatistics({ projectSlug }: { projectSlug: string }) {
    try {
      const stats = await this.statisticsService.getProjectStatistics(projectSlug);

      return {
        content: [
          {
            type: 'text',
            text: this.formatProjectStatistics(projectSlug, stats),
          },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to get project statistics for ${projectSlug}`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error getting project statistics: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'getComponentStatistics',
    description: 'Get detailed statistics for a specific component',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project'),
      componentSlug: z.string().describe('The slug of the component'),
    }),
  })
  async getComponentStatistics({
    projectSlug,
    componentSlug,
  }: {
    projectSlug: string;
    componentSlug: string;
  }) {
    try {
      const stats = await this.statisticsService.getComponentStatistics(projectSlug, componentSlug);

      return {
        content: [
          {
            type: 'text',
            text: this.formatComponentStatistics(projectSlug, componentSlug, stats),
          },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to get component statistics for ${projectSlug}/${componentSlug}`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error getting component statistics: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'getProjectDashboard',
    description: 'Get a comprehensive dashboard overview for a project with all component statistics',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project'),
    }),
  })
  async getProjectDashboard({ projectSlug }: { projectSlug: string }) {
    try {
      const dashboard = await this.statisticsService.getProjectDashboard(projectSlug);

      return {
        content: [
          {
            type: 'text',
            text: this.formatProjectDashboard(projectSlug, dashboard),
          },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to get project dashboard for ${projectSlug}`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error getting project dashboard: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'getTranslationStatistics',
    description: 'Get statistics for a specific translation (project/component/language combination)',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project'),
      componentSlug: z.string().describe('The slug of the component'),
      languageCode: z.string().describe('The language code (e.g., en, es, fr)'),
    }),
  })
  async getTranslationStatistics({
    projectSlug,
    componentSlug,
    languageCode,
  }: {
    projectSlug: string;
    componentSlug: string;
    languageCode: string;
  }) {
    try {
      const stats = await this.statisticsService.getTranslationStatistics(
        projectSlug,
        componentSlug,
        languageCode,
      );

      return {
        content: [
          {
            type: 'text',
            text: this.formatTranslationStatistics(projectSlug, componentSlug, languageCode, stats),
          },
        ],
      };
    } catch (error) {
      this.logger.error(
        `Failed to get translation statistics for ${projectSlug}/${componentSlug}/${languageCode}`,
        error,
      );
      return {
        content: [
          {
            type: 'text',
            text: `Error getting translation statistics: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'getComponentLanguageProgress',
    description: 'Get translation progress for all languages in a component',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project'),
      componentSlug: z.string().describe('The slug of the component'),
    }),
  })
  async getComponentLanguageProgress({
    projectSlug,
    componentSlug,
  }: {
    projectSlug: string;
    componentSlug: string;
  }) {
    try {
      const progress = await this.statisticsService.getComponentLanguageProgress(
        projectSlug,
        componentSlug,
      );

      return {
        content: [
          {
            type: 'text',
            text: this.formatComponentLanguageProgress(projectSlug, componentSlug, progress),
          },
        ],
      };
    } catch (error) {
      this.logger.error(
        `Failed to get component language progress for ${projectSlug}/${componentSlug}`,
        error,
      );
      return {
        content: [
          {
            type: 'text',
            text: `Error getting component language progress: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'getLanguageStatistics',
    description: 'Get statistics for a specific language across all projects',
    parameters: z.object({
      languageCode: z.string().describe('The language code (e.g., en, es, fr)'),
    }),
  })
  async getLanguageStatistics({ languageCode }: { languageCode: string }) {
    try {
      const stats = await this.statisticsService.getLanguageStatistics(languageCode);

      return {
        content: [
          {
            type: 'text',
            text: this.formatLanguageStatistics(languageCode, stats),
          },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to get language statistics for ${languageCode}`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error getting language statistics: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'getUserStatistics',
    description: 'Get contribution statistics for a specific user',
    parameters: z.object({
      username: z.string().describe('The username to get statistics for'),
    }),
  })
  async getUserStatistics({ username }: { username: string }) {
    try {
      const stats = await this.statisticsService.getUserStatistics(username);

      return {
        content: [
          {
            type: 'text',
            text: this.formatUserStatistics(username, stats),
          },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to get user statistics for ${username}`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error getting user statistics: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  private formatProjectStatistics(projectSlug: string, stats: any): string {
    const getStatValue = (key: string, defaultValue = 'N/A') => {
      return stats?.[key] !== undefined ? stats[key] : defaultValue;
    };

    const formatPercent = (value: any) => {
      return typeof value === 'number' ? `${value.toFixed(1)}%` : 'N/A';
    };

    return `## 📊 Project Statistics: ${stats?.name || projectSlug}

**Overall Progress:**
- 🎯 Translation Progress: ${formatPercent(getStatValue('translated_percent'))}
- ✅ Approved: ${formatPercent(getStatValue('approved_percent'))}
- 🔍 Needs Review: ${formatPercent(getStatValue('readonly_percent'))}
- ❌ Untranslated: ${formatPercent(getStatValue('nottranslated_percent'))}

**String Counts:**
- 📝 Total Strings: ${getStatValue('total')}
- ✅ Translated: ${getStatValue('translated')}
- 🎯 Approved: ${getStatValue('approved')}
- ❌ Untranslated: ${getStatValue('nottranslated')}
- 🔍 Read-only: ${getStatValue('readonly')}

**Project Details:**
- 🌐 URL: ${stats?.web_url || 'N/A'}
- 🔗 Repository: ${stats?.repository_url || 'N/A'}`;
  }

  private formatComponentStatistics(projectSlug: string, componentSlug: string, stats: any): string {
    const getStatValue = (key: string, defaultValue = 'N/A') => {
      return stats?.[key] !== undefined ? stats[key] : defaultValue;
    };

    const formatPercent = (value: any) => {
      return typeof value === 'number' ? `${value.toFixed(1)}%` : 'N/A';
    };

    return `## 📊 Component Statistics: ${stats?.name || componentSlug}

**Project:** ${projectSlug}
**Component:** ${componentSlug}

**Translation Progress:**
- 🎯 Translated: ${formatPercent(getStatValue('translated_percent'))}
- ✅ Approved: ${formatPercent(getStatValue('approved_percent'))}
- 🔍 Needs Review: ${formatPercent(getStatValue('readonly_percent'))}
- ❌ Untranslated: ${formatPercent(getStatValue('nottranslated_percent'))}

**String Counts:**
- 📝 Total: ${getStatValue('total')}
- ✅ Translated: ${getStatValue('translated')}
- 🎯 Approved: ${getStatValue('approved')}
- ❌ Untranslated: ${getStatValue('nottranslated')}

**Component Details:**
- 🌐 URL: ${stats?.web_url || 'N/A'}
- 📁 Source Language: ${stats?.source_language?.name || 'N/A'} (${stats?.source_language?.code || 'N/A'})`;
  }

  private formatTranslationStatistics(
    projectSlug: string,
    componentSlug: string,
    languageCode: string,
    stats: any,
  ): string {
    const getStatValue = (key: string, defaultValue = 'N/A') => {
      return stats?.[key] !== undefined ? stats[key] : defaultValue;
    };

    const formatPercent = (value: any) => {
      return typeof value === 'number' ? `${value.toFixed(1)}%` : 'N/A';
    };

    return `## 📊 Translation Statistics

**Translation:** ${projectSlug}/${componentSlug}/${languageCode}

**Progress:**
- 🎯 Translated: ${formatPercent(getStatValue('translated_percent'))}
- ✅ Approved: ${formatPercent(getStatValue('approved_percent'))}
- 🔍 Needs Review: ${formatPercent(getStatValue('readonly_percent'))}
- ❌ Untranslated: ${formatPercent(getStatValue('nottranslated_percent'))}

**String Details:**
- 📝 Total Strings: ${getStatValue('total')}
- ✅ Translated: ${getStatValue('translated')}
- 🎯 Approved: ${getStatValue('approved')}
- ❌ Untranslated: ${getStatValue('nottranslated')}
- 🔍 Readonly: ${getStatValue('readonly')}

**Quality Metrics:**
- ⚠️ Failing Checks: ${getStatValue('failing_percent', '0')}%
- 💡 Suggestions: ${getStatValue('suggestions')}
- 💬 Comments: ${getStatValue('comments')}`;
  }

  private formatProjectDashboard(projectSlug: string, dashboard: any): string {
    const project = dashboard.project;
    const components = dashboard.components || [];

    let result = this.formatProjectStatistics(projectSlug, project);
    result += '\n\n## 📋 Component Breakdown\n\n';

    components.forEach((comp: any, index: number) => {
      if (comp.statistics) {
        const stats = comp.statistics;
        const formatPercent = (value: any) => {
          return typeof value === 'number' ? `${value.toFixed(1)}%` : 'N/A';
        };

        result += `**${index + 1}. ${comp.component}** (${comp.slug})
- 🎯 Progress: ${formatPercent(stats.translated_percent)}
- ✅ Approved: ${formatPercent(stats.approved_percent)}
- 📝 Total Strings: ${stats.total || 'N/A'}

`;
      } else {
        result += `**${index + 1}. ${comp.component}** (${comp.slug})
- ❌ Error: ${comp.error || 'Unable to load statistics'}

`;
      }
    });

    return result;
  }

  private formatComponentLanguageProgress(
    projectSlug: string,
    componentSlug: string,
    progress: any[],
  ): string {
    let result = `## 🌐 Language Progress: ${projectSlug}/${componentSlug}\n\n`;

    progress.forEach((lang: any, index: number) => {
      if (lang.statistics) {
        const stats = lang.statistics;
        const formatPercent = (value: any) => {
          return typeof value === 'number' ? `${value.toFixed(1)}%` : 'N/A';
        };

        const progressBar = this.generateProgressBar(stats.translated_percent || 0);

        result += `**${index + 1}. ${lang.language}** (${lang.code})
${progressBar} ${formatPercent(stats.translated_percent)}
- ✅ Approved: ${formatPercent(stats.approved_percent)}
- 📝 Total: ${stats.total || 'N/A'} | Translated: ${stats.translated || 'N/A'}

`;
      } else {
        result += `**${index + 1}. ${lang.language}** (${lang.code})
- ❌ Error: ${lang.error || 'Unable to load statistics'}

`;
      }
    });

    return result;
  }

  private formatLanguageStatistics(languageCode: string, stats: any): string {
    const getStatValue = (key: string, defaultValue = 'N/A') => {
      return stats?.[key] !== undefined ? stats[key] : defaultValue;
    };

    const formatPercent = (value: any) => {
      return typeof value === 'number' ? `${value.toFixed(1)}%` : 'N/A';
    };

    return `## 🌐 Language Statistics: ${stats?.name || languageCode}

**Language Details:**
- 📛 Name: ${getStatValue('name')}
- 🔤 Code: ${getStatValue('code')}
- 📍 Direction: ${getStatValue('direction', 'ltr')}

**Overall Progress:**
- 🎯 Translated: ${formatPercent(getStatValue('translated_percent'))}
- ✅ Approved: ${formatPercent(getStatValue('approved_percent'))}
- ❌ Untranslated: ${formatPercent(getStatValue('nottranslated_percent'))}

**String Counts:**
- 📝 Total: ${getStatValue('total')}
- ✅ Translated: ${getStatValue('translated')}
- 🎯 Approved: ${getStatValue('approved')}
- ❌ Untranslated: ${getStatValue('nottranslated')}`;
  }

  private formatUserStatistics(username: string, stats: any): string {
    const getStatValue = (key: string, defaultValue = 'N/A') => {
      return stats?.[key] !== undefined ? stats[key] : defaultValue;
    };

    return `## 👤 User Statistics: ${stats?.full_name || username}

**User Details:**
- 👤 Username: ${getStatValue('username')}
- 📧 Email: ${getStatValue('email')}
- 📅 Joined: ${stats?.date_joined ? new Date(stats.date_joined).toLocaleDateString() : 'N/A'}

**Contribution Stats:**
- ✏️ Translations: ${getStatValue('translated')}
- ✅ Approved: ${getStatValue('approved')}
- 💡 Suggestions: ${getStatValue('suggestions')}
- 💬 Comments: ${getStatValue('comments')}

**Activity:**
- 📈 Total Changes: ${getStatValue('total_changes')}
- 🗓️ Last Activity: ${stats?.last_login ? new Date(stats.last_login).toLocaleDateString() : 'N/A'}`;
  }

  private generateProgressBar(percentage: number): string {
    const width = 20;
    const filled = Math.max(0, Math.min(width, Math.floor((percentage / 100) * width)));
    const empty = Math.max(0, width - filled);
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  }
} 