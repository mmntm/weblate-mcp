import { Injectable, Logger } from '@nestjs/common';
import { WeblateClientService } from '../weblate-client.service';
import { unitsList, unitsPartialUpdate, type Unit, type PaginatedUnitList } from '../../client';
import { SearchIn } from '../../types';

@Injectable()
export class WeblateTranslationsService {
  private readonly logger = new Logger(WeblateTranslationsService.name);

  constructor(private weblateClientService: WeblateClientService) {}

  async searchTranslations(
    projectSlug: string,
    componentSlug?: string,
    languageCode?: string,
    query?: string,
    source?: string,
    target?: string,
  ): Promise<{ results: Unit[]; count: number; next?: string; previous?: string }> {
    try {
      const client = this.weblateClientService.getClient();
      
      // For now, let's try a direct API call with the raw client
      // since the generated endpoints seem to be incomplete
      let url = '/units/';
      const params = new URLSearchParams();
      
      // Build search query
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
      
      // Add project filter
      q_parts.push(`project:${projectSlug}`);
      
      // Add component filter if specified
      if (componentSlug) {
        q_parts.push(`component:${componentSlug}`);
      }
      
      // Add language filter if specified
      if (languageCode) {
        q_parts.push(`language:${languageCode}`);
      }

      if (q_parts.length > 0) {
        params.append('q', q_parts.join(' '));
      }
      
      params.append('page_size', '1000');
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      // Use the raw client to make the request
      const response = await client.request({
        url,
        method: 'GET',
      });
      
      const data = response.data as any;
      
      return {
        results: data.results || [],
        count: data.count || 0,
        next: data.next || undefined,
        previous: data.previous || undefined,
      };
    } catch (error) {
      this.logger.error(
        `Failed to search translations: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to search translations: ${error.message}`);
    }
  }

  async getTranslationByKey(
    projectSlug: string,
    componentSlug: string,
    languageCode: string,
    key: string,
  ): Promise<Unit | null> {
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
  ): Promise<Unit[]> {
    try {
      let results: Unit[] = [];

      if (searchIn === 'source' || searchIn === 'both') {
        const sourceResults = await this.searchTranslations(
          projectSlug,
          undefined,
          undefined,
          undefined,
          searchValue,
        );
        results = results.concat(sourceResults.results);
      }

      if (searchIn === 'target' || searchIn === 'both') {
        const targetResults = await this.searchTranslations(
          projectSlug,
          undefined,
          undefined,
          undefined,
          undefined,
          searchValue,
        );
        results = results.concat(targetResults.results);
      }

      // Remove duplicates based on unit ID
      const uniqueResults = results.filter(
        (unit, index, self) => 
          index === self.findIndex(u => u.id === unit.id)
      );

      return uniqueResults;
    } catch (error) {
      this.logger.error(
        `Failed to search string in project ${projectSlug}`,
        error,
      );
      throw new Error(
        `Failed to search string in project: ${error.message}`,
      );
    }
  }

  async writeTranslation(
    projectSlug: string,
    componentSlug: string,
    languageCode: string,
    key: string,
    value: string,
    markAsApproved: boolean = false,
  ): Promise<Unit | null> {
    try {
      // First, find the translation unit by key
      const unit = await this.getTranslationByKey(
        projectSlug,
        componentSlug,
        languageCode,
        key,
      );

      if (!unit || !unit.id) {
        throw new Error(`Translation unit not found for key "${key}"`);
      }

      const client = this.weblateClientService.getClient();
      
      // Update the translation using the units API
      const response = await unitsPartialUpdate({
        client,
        path: { id: unit.id.toString() },
        body: {
          target: [value], // Weblate expects array of strings
          state: markAsApproved ? 30 : 20, // 30 = approved, 20 = translated
        },
      });

      return response.data as Unit;
    } catch (error) {
      this.logger.error(`Failed to write translation for key ${key}`, error);
      throw new Error(
        `Failed to write translation for key ${key}: ${error.message}`,
      );
    }
  }

  async findTranslationsForKey(
    projectSlug: string,
    key: string,
    componentSlug?: string,
  ): Promise<Unit[]> {
    try {
      const searchResult = await this.searchTranslations(
        projectSlug,
        componentSlug,
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