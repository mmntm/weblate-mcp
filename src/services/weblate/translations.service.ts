import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseWeblateService } from './base-weblate.service';
import { 
  WeblateTranslation, 
  WeblateSearchResult, 
  SearchIn 
} from '../../types';

@Injectable()
export class WeblateTranslationsService extends BaseWeblateService {
  constructor(configService: ConfigService) {
    super(configService);
  }

  async searchTranslations(
    projectSlug: string,
    componentSlug?: string,
    languageCode?: string,
    query?: string,
    source?: string,
    target?: string,
  ): Promise<WeblateSearchResult> {
    try {
      const params = new URLSearchParams();

      const q_parts = [];
      if (query) {
        q_parts.push(query);
      }
      if (source) {
        q_parts.push(`source:"${source}"`);
      }
      if (target) {
        q_parts.push(`target:"${target}"`);
      }

      if (q_parts.length > 0) {
        params.append('q', q_parts.join(' '));
      }

      let endpoint: string;
      if (componentSlug && languageCode) {
        endpoint = `/projects/${projectSlug}/components/${componentSlug}/translations/${languageCode}/units/`;
      } else if (componentSlug) {
        // Search across all languages in a component
        endpoint = `/projects/${projectSlug}/components/${componentSlug}/units/`;
      } else {
        // Search across all components in a project
        endpoint = `/units/`;
        params.append('project', projectSlug);
      }

      const response = await this.apiClient.get(endpoint, { params });
      
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to search translations: ${error.message}`,
        error.stack,
      );
      if (error.response) {
        this.logger.error(
          `Weblate API error: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new Error(`Failed to search translations: ${error.message}`);
    }
  }

  async getTranslationByKey(
    projectSlug: string,
    componentSlug: string,
    languageCode: string,
    key: string,
  ): Promise<WeblateTranslation | null> {
    try {
      const searchResult = await this.searchTranslations(
        projectSlug,
        componentSlug,
        languageCode,
        `context:"${key}"`,
      );

      return searchResult.results.length > 0 ? searchResult.results[0] : null;
    } catch (error) {
      this.logger.error(`Failed to get translation for key ${key}`, error);
      throw new Error(
        `Failed to get translation for key ${key}: ${error.message}`,
      );
    }
  }

  async searchStringInProject(
    projectSlug: string,
    searchValue: string,
    searchIn: SearchIn = 'both',
  ): Promise<WeblateTranslation[]> {
    try {
      let results: WeblateTranslation[] = [];

      if (searchIn === 'source' || searchIn === 'both') {
        const sourceResult = await this.searchTranslations(
          projectSlug,
          undefined,
          undefined,
          undefined,
          searchValue,
        );
        results.push(...sourceResult.results);
      }

      if (searchIn === 'target' || searchIn === 'both') {
        const targetResult = await this.searchTranslations(
          projectSlug,
          undefined,
          undefined,
          undefined,
          undefined,
          searchValue,
        );
        results.push(...targetResult.results);
      }

      // Deduplicate results by id
      const uniqueResults = results.reduce((acc, current) => {
        if (!acc.find((item) => item.id === current.id)) {
          acc.push(current);
        }
        return acc;
      }, []);

      return uniqueResults;
    } catch (error) {
      this.logger.error(
        `Failed to search string "${searchValue}" in project ${projectSlug}`,
        error,
      );
      throw new Error(`Failed to search string: ${error.message}`);
    }
  }

  async findBestTranslationMatch(
    projectSlug: string,
    searchValue: string,
    context?: string,
  ): Promise<WeblateTranslation[]> {
    try {
      // First, try to find exact matches in source text
      let results = await this.searchStringInProject(
        projectSlug,
        searchValue,
        'source',
      );

      if (results.length === 0) {
        // If no exact match, try fuzzy search
        results = await this.searchStringInProject(
          projectSlug,
          searchValue,
          'both',
        );
      }

      // If context is provided, try to filter results by context
      if (context && results.length > 1) {
        const contextWords = context.toLowerCase().split(/\s+/);
        results = results.filter((translation) => {
          const translationContext = (
            translation.context +
            ' ' +
            translation.source.join('') +
            ' ' +
            translation.note
          ).toLowerCase();
          return contextWords.some((word) => translationContext.includes(word));
        });
      }

      return results;
    } catch (error) {
      this.logger.error(
        `Failed to find best translation match for "${searchValue}"`,
        error,
      );
      throw new Error(`Failed to find translation match: ${error.message}`);
    }
  }

  async writeTranslation(
    projectSlug: string,
    componentSlug: string,
    languageCode: string,
    key: string,
    value: string,
    markAsApproved: boolean = false,
  ): Promise<WeblateTranslation> {
    try {
      // First, find all translations for this key across all components
      const allTranslations = await this.findTranslationsForKey(
        projectSlug,
        key,
      );

      if (allTranslations.length === 0) {
        throw new Error(
          `Translation not found for key "${key}" in project ${projectSlug}`,
        );
      }

      // Find the specific translation for the target language
      const targetTranslation = allTranslations.find(
        t => t.language_code === languageCode
      );

      if (!targetTranslation) {
        throw new Error(
          `Translation not found for key "${key}" in language ${languageCode} in project ${projectSlug}`,
        );
      }

      // Update the translation
      const updateData: any = {
        target: [value],
        state: markAsApproved ? 20 : 10, // 20 = approved, 10 = translated
      };

      const response = await this.apiClient.patch(
        `/units/${targetTranslation.id}/`,
        updateData,
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to write translation for key ${key}`, error);
      if (error.response) {
        this.logger.error(
          `Weblate API error: ${error.response.status} ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new Error(
        `Failed to write translation for key "${key}": ${error.message}`,
      );
    }
  }

  /**
   * Search for translations by key pattern across all components in a project
   */
  async searchTranslationsByKey(
    projectSlug: string,
    keyPattern: string,
    componentSlug?: string,
    languageCode?: string,
    exactMatch: boolean = false,
  ): Promise<WeblateTranslation[]> {
    try {
      const searchQuery = exactMatch 
        ? `context:"${keyPattern}"` 
        : `context:${keyPattern}`;

      const searchResult = await this.searchTranslations(
        projectSlug,
        componentSlug,
        languageCode,
        searchQuery,
      );

      return searchResult.results;
    } catch (error) {
      this.logger.error(
        `Failed to search translations by key pattern "${keyPattern}" in project ${projectSlug}`,
        error,
      );
      throw new Error(
        `Failed to search translations by key: ${error.message}`,
      );
    }
  }

  /**
   * Find all translations for a specific key across all components and languages in a project
   */
  async findTranslationsForKey(
    projectSlug: string,
    key: string,
  ): Promise<WeblateTranslation[]> {
    try {
      // Search for exact key match across all components and languages
      const searchResult = await this.searchTranslations(
        projectSlug,
        undefined,
        undefined,
        `context:"${key}"`,
      );
      
      return searchResult.results;
    } catch (error) {
      this.logger.error(
        `Failed to find translations for key "${key}" in project ${projectSlug}`,
        error,
      );
      throw new Error(
        `Failed to find translations for key: ${error.message}`,
      );
    }
  }

  /**
   * Get all translation keys in a project (optionally filtered by component)
   */
  async listTranslationKeys(
    projectSlug: string,
    componentSlug?: string,
    languageCode?: string,
  ): Promise<string[]> {
    try {
      const searchResult = await this.searchTranslations(
        projectSlug,
        componentSlug,
        languageCode,
      );

      // Extract unique keys from the context field
      const keys = [...new Set(
        searchResult.results
          .map(translation => translation.context)
          .filter(context => context && context.trim() !== '')
      )];

      return keys.sort();
    } catch (error) {
      this.logger.error(
        `Failed to list translation keys in project ${projectSlug}`,
        error,
      );
      throw new Error(
        `Failed to list translation keys: ${error.message}`,
      );
    }
  }

  /**
   * Search for translation keys by pattern
   */
  async searchTranslationKeys(
    projectSlug: string,
    keyPattern: string,
    componentSlug?: string,
  ): Promise<string[]> {
    try {
      const allKeys = await this.listTranslationKeys(projectSlug, componentSlug);
      
      // Filter keys that match the pattern (case-insensitive)
      const matchingKeys = allKeys.filter(key => 
        key.toLowerCase().includes(keyPattern.toLowerCase())
      );

      return matchingKeys;
    } catch (error) {
      this.logger.error(
        `Failed to search translation keys by pattern "${keyPattern}" in project ${projectSlug}`,
        error,
      );
      throw new Error(
        `Failed to search translation keys: ${error.message}`,
      );
    }
  }
} 