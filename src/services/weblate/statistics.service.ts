import { Injectable, Logger } from '@nestjs/common';
import { WeblateClientService } from '../weblate-client.service';
import { WeblateComponentsService } from './components.service';
import { WeblateLanguagesService } from './languages.service';
import {
  projectsStatisticsRetrieve,
  componentsStatisticsRetrieve,
  translationsStatisticsRetrieve,
  languagesStatisticsRetrieve,
  usersStatisticsRetrieve,
} from '../../client';

@Injectable()
export class WeblateStatisticsService {
  private readonly logger = new Logger(WeblateStatisticsService.name);

  constructor(
    private clientService: WeblateClientService,
    private componentsService: WeblateComponentsService,
    private languagesService: WeblateLanguagesService,
  ) {}

  /**
   * Get comprehensive statistics for a project
   */
  async getProjectStatistics(projectSlug: string) {
    try {
      const response = await projectsStatisticsRetrieve({
        client: this.clientService.getClient(),
        path: { slug: projectSlug },
        query: { format: 'json' },
      });

      if (response.error) {
        throw new Error(`Failed to get project statistics: ${response.error}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get project statistics for ${projectSlug}`, error);
      throw error;
    }
  }

  /**
   * Get detailed statistics for a component
   */
  async getComponentStatistics(projectSlug: string, componentSlug: string) {
    try {
      const response = await componentsStatisticsRetrieve({
        client: this.clientService.getClient(),
        path: { 
          project__slug: projectSlug,
          slug: componentSlug 
        },
        query: { format: 'json' },
      });

      if (response.error) {
        throw new Error(`Failed to get component statistics: ${response.error}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get component statistics for ${projectSlug}/${componentSlug}`, error);
      throw error;
    }
  }

  /**
   * Get translation statistics for a specific language in a component
   */
  async getTranslationStatistics(
    projectSlug: string,
    componentSlug: string,
    languageCode: string,
  ) {
    try {
      const response = await translationsStatisticsRetrieve({
        client: this.clientService.getClient(),
        path: {
          component__project__slug: projectSlug,
          component__slug: componentSlug,
          language__code: languageCode,
        },
        query: { format: 'json' },
      });

      if (response.error) {
        throw new Error(`Failed to get translation statistics: ${response.error}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to get translation statistics for ${projectSlug}/${componentSlug}/${languageCode}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get statistics for a specific language across all projects
   */
  async getLanguageStatistics(languageCode: string) {
    try {
      const response = await languagesStatisticsRetrieve({
        client: this.clientService.getClient(),
        path: { code: languageCode },
        query: { format: 'json' },
      });

      if (response.error) {
        throw new Error(`Failed to get language statistics: ${response.error}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get language statistics for ${languageCode}`, error);
      throw error;
    }
  }

  /**
   * Get user contribution statistics
   */
  async getUserStatistics(username: string) {
    try {
      const response = await usersStatisticsRetrieve({
        client: this.clientService.getClient(),
        path: { username },
        query: { format: 'json' },
      });

      if (response.error) {
        throw new Error(`Failed to get user statistics: ${response.error}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get user statistics for ${username}`, error);
      throw error;
    }
  }

  /**
   * Get dashboard overview for a project with all component statistics
   */
  async getProjectDashboard(projectSlug: string) {
    try {
      // Get project info and components
      const [projectStats, components] = await Promise.all([
        this.getProjectStatistics(projectSlug),
        this.componentsService.listComponents(projectSlug),
      ]);

      // Get statistics for each component
      const componentStats = await Promise.all(
        components.map(async (component) => {
          try {
            const stats = await this.getComponentStatistics(projectSlug, component.slug);
            return {
              component: component.name,
              slug: component.slug,
              statistics: stats,
            };
          } catch (error) {
            this.logger.warn(`Failed to get stats for component ${component.slug}`, error);
            return {
              component: component.name,
              slug: component.slug,
              statistics: null,
              error: error.message,
            };
          }
        }),
      );

      return {
        project: projectStats,
        components: componentStats,
      };
    } catch (error) {
      this.logger.error(`Failed to get project dashboard for ${projectSlug}`, error);
      throw error;
    }
  }

  /**
   * Get translation progress for all languages in a component
   */
  async getComponentLanguageProgress(projectSlug: string, componentSlug: string) {
    try {
      // Get available languages for the project
      const languages = await this.languagesService.listLanguages(projectSlug);

      // Get translation statistics for each language
      const languageProgress = await Promise.all(
        languages.map(async (language) => {
          try {
            const stats = await this.getTranslationStatistics(
              projectSlug,
              componentSlug,
              language.code,
            );
            return {
              language: language.name,
              code: language.code,
              statistics: stats,
            };
          } catch (error) {
            this.logger.warn(
              `Failed to get translation stats for ${language.code} in ${componentSlug}`,
              error,
            );
            return {
              language: language.name,
              code: language.code,
              statistics: null,
              error: error.message,
            };
          }
        }),
      );

      return languageProgress;
    } catch (error) {
      this.logger.error(
        `Failed to get component language progress for ${projectSlug}/${componentSlug}`,
        error,
      );
      throw error;
    }
  }
} 