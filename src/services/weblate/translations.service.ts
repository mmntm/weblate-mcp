import { Injectable, Logger } from '@nestjs/common';
import { WeblateClientService } from '../weblate-client.service';
import { unitsList, unitsPartialUpdate, translationsUnitsRetrieve, type Unit, type PaginatedUnitList, type UnitsListData, type TranslationsUnitsRetrieveData } from '../../client';
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

      // Use the generated SDK with extended types to include the missing 'q' parameter
      const options: UnitsListData & { query?: { q?: string; page_size?: number } } = {
        url: '/units/',
        query: {
          page_size: 1000,
        },
      };

      if (q_parts.length > 0) {
        options.query!.q = q_parts.join(' ');
      }

      const response = await unitsList({
        client,
        ...options,
      });
      
      if (response.error) {
        throw new Error(`API error: ${JSON.stringify(response.error)}`);
      }
      
      const data = response.data as PaginatedUnitList;
      
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
      
      // Parse plural forms correctly for the target field using language-specific rules
      const targetArray = this.parsePluralForms(value, unit.source, languageCode);
      
      // Update the translation using the units API
      const response = await unitsPartialUpdate({
        client,
        path: { id: unit.id.toString() },
        body: {
          target: targetArray, // Properly parsed plural forms
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

  /**
   * Bulk update multiple translations efficiently
   */
  async bulkWriteTranslations(
    projectSlug: string,
    componentSlug: string,
    languageCode: string,
    translations: Array<{
      key: string;
      value: string;
      markAsApproved?: boolean;
    }>,
  ): Promise<{
    successful: Array<{ key: string; unit: Unit }>;
    failed: Array<{ key: string; error: string }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    const successful: Array<{ key: string; unit: Unit }> = [];
    const failed: Array<{ key: string; error: string }> = [];

    this.logger.log(`Starting bulk update of ${translations.length} translations for ${projectSlug}/${componentSlug}/${languageCode}`);

    // Process translations in parallel (but with some concurrency control)
    const concurrencyLimit = 5; // Limit concurrent requests to avoid overwhelming the API
    const chunks = [];
    for (let i = 0; i < translations.length; i += concurrencyLimit) {
      chunks.push(translations.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async ({ key, value, markAsApproved = false }) => {
        try {
          const updatedUnit = await this.writeTranslation(
            projectSlug,
            componentSlug,
            languageCode,
            key,
            value,
            markAsApproved,
          );

          if (updatedUnit) {
            successful.push({ key, unit: updatedUnit });
            this.logger.debug(`Successfully updated translation for key: ${key}`);
          } else {
            failed.push({ key, error: 'No unit returned from update' });
          }
        } catch (error) {
          failed.push({ key, error: error.message });
          this.logger.warn(`Failed to update translation for key ${key}: ${error.message}`);
        }
      });

      // Wait for current chunk to complete before processing next chunk
      await Promise.allSettled(promises);
    }

    const summary = {
      total: translations.length,
      successful: successful.length,
      failed: failed.length,
    };

    this.logger.log(`Bulk update completed: ${summary.successful}/${summary.total} successful, ${summary.failed} failed`);

    return {
      successful,
      failed,
      summary,
    };
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

  /**
   * Search units with custom Weblate query filters
   * This provides direct access to Weblate's powerful search capabilities
   */
  async searchUnitsWithQuery(
    projectSlug: string,
    componentSlug: string,
    languageCode: string,
    searchQuery: string,
    limit: number = 50,
  ): Promise<Unit[]> {
    try {
      const client = this.weblateClientService.getClient();
      
      // Build the complete search query by combining user query with scope filters
      const queryParts = [searchQuery];
      queryParts.push(`project:${projectSlug}`);
      queryParts.push(`component:${componentSlug}`);
      queryParts.push(`language:${languageCode}`);
      
      // Use the generated SDK with extended types to include the missing 'q' parameter
      const options: UnitsListData & { query?: { q?: string; page_size?: number } } = {
        url: '/units/',
        query: {
          q: queryParts.join(' AND '),
          page_size: Math.min(limit, 1000),
        },
      };

      const response = await unitsList({
        client,
        ...options,
      });
      
      if (response.error) {
        throw new Error(`API error: ${JSON.stringify(response.error)}`);
      }
      
      const data = response.data as PaginatedUnitList;
      return data.results || [];
    } catch (error) {
      this.logger.error(
        `Failed to search units with query "${searchQuery}" in ${projectSlug}/${componentSlug}/${languageCode}`,
        error,
      );
      throw new Error(
        `Failed to search units: ${error.message}`,
      );
    }
  }

  /**
   * Language-specific pluralization rules mapping
   * Based on CLDR (Unicode Common Locale Data Repository) rules
   */
  private readonly PLURALIZATION_RULES = {
    // 2 forms: singular (n=1), plural (n!=1)
    'en': { forms: 2, rule: 'n != 1' },  // English
    'de': { forms: 2, rule: 'n != 1' },  // German
    'es': { forms: 2, rule: 'n != 1' },  // Spanish
    'fr': { forms: 2, rule: 'n > 1' },   // French
    'it': { forms: 2, rule: 'n != 1' },  // Italian
    'pt': { forms: 2, rule: 'n != 1' },  // Portuguese
    'nl': { forms: 2, rule: 'n != 1' },  // Dutch
    'da': { forms: 2, rule: 'n != 1' },  // Danish
    'sv': { forms: 2, rule: 'n != 1' },  // Swedish
    'no': { forms: 2, rule: 'n != 1' },  // Norwegian
    
    // 3 forms: one, few, many/other
    'cs': { forms: 3, rule: '(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2' },  // Czech
    'sk': { forms: 3, rule: '(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2' },  // Slovak
    'pl': { forms: 3, rule: '(n==1) ? 0 : (n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20)) ? 1 : 2' },  // Polish
    'hr': { forms: 3, rule: '(n%10==1 && n%100!=11) ? 0 : (n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20)) ? 1 : 2' },  // Croatian
    'sr': { forms: 3, rule: '(n%10==1 && n%100!=11) ? 0 : (n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20)) ? 1 : 2' },  // Serbian
    
    // 4 forms: one, few, many, other
    'sl': { forms: 4, rule: '(n%100==1) ? 0 : (n%100==2) ? 1 : (n%100==3 || n%100==4) ? 2 : 3' },  // Slovenian
    
    // 6 forms: zero, one, two, few, many, other
    'ar': { forms: 6, rule: '(n==0) ? 0 : (n==1) ? 1 : (n==2) ? 2 : (n%100>=3 && n%100<=10) ? 3 : (n%100>=11) ? 4 : 5' },  // Arabic
    
    // Default fallback for unknown languages
    'default': { forms: 2, rule: 'n != 1' }
  };

  /**
   * Get the expected number of plural forms for a language
   */
  private getExpectedPluralForms(languageCode: string): number {
    const langRule = this.PLURALIZATION_RULES[languageCode] || this.PLURALIZATION_RULES['default'];
    return langRule.forms;
  }

  /**
   * Parse plural forms from a concatenated string into an array
   * Uses language-specific pluralization rules to determine expected number of forms
   */
  private parsePluralForms(value: string, sourceArray: Array<string>, languageCode: string): Array<string> {
    // If source is not an array or has only one element, treat as singular
    if (!Array.isArray(sourceArray) || sourceArray.length <= 1) {
      return [value];
    }

    // Get expected plural forms count based on language rules
    const expectedPluralCount = this.getExpectedPluralForms(languageCode);
    
    // Fallback to source array length if it's different (might be source language specific)
    const targetPluralCount = Math.max(expectedPluralCount, sourceArray.length);
    
    // For plural forms, split on the pattern where %d starts a new plural form
    // This handles cases like "%d day%d days" -> ["%d day", "%d days"]
    // Or "%d účastník%d účastníci%d účastníkov" -> ["%d účastník", "%d účastníci", "%d účastníkov"]
    
    // Enhanced splitting logic that handles various separators and patterns
    let parts: string[] = [];
    
    // Method 1: Split by %d pattern (most common)
    const percentDParts = value.split(/(?=%d)/g).filter(part => part.length > 0);
    
    if (percentDParts.length === targetPluralCount) {
      parts = percentDParts;
    } else if (percentDParts.length > 1) {
      // Method 2: Try to intelligently redistribute parts
      if (percentDParts.length > targetPluralCount) {
        // Too many parts - combine excess with last expected part
        parts = percentDParts.slice(0, targetPluralCount - 1);
        parts.push(percentDParts.slice(targetPluralCount - 1).join(''));
      } else {
        // Too few parts - use what we have
        parts = percentDParts;
      }
    } else {
      // Method 3: Alternative splitting strategies for edge cases
      
      // Try splitting by common word boundaries in some languages
      const wordBoundaryPattern = /(?<=%d\s+[^\s%]+)(?=\s*%d)|(?<=%d[^\s%]+)(?=%d)/g;
      const wordParts = value.split(wordBoundaryPattern).filter(part => part.length > 0);
      
      if (wordParts.length === targetPluralCount) {
        parts = wordParts;
      } else {
        // Final fallback: assume uniform distribution
        const avgLength = Math.floor(value.length / targetPluralCount);
        parts = [];
        for (let i = 0; i < targetPluralCount; i++) {
          const start = i * avgLength;
          const end = i === targetPluralCount - 1 ? value.length : (i + 1) * avgLength;
          parts.push(value.substring(start, end));
        }
      }
    }
    
    // Ensure we have the correct number of parts
    while (parts.length < targetPluralCount) {
      parts.push(''); // Pad with empty strings if needed
    }
    
    // Trim excess parts if we have too many
    if (parts.length > targetPluralCount) {
      parts = parts.slice(0, targetPluralCount);
    }
    
    // Clean up parts - remove empty ones except if that would reduce count below minimum
    const cleanedParts = parts.filter(part => part.trim().length > 0);
    if (cleanedParts.length >= targetPluralCount) {
      return cleanedParts.slice(0, targetPluralCount);
    }
    
    return parts;
  }
} 