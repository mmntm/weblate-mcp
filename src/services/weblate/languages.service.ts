import { Injectable, Logger } from '@nestjs/common';
import { WeblateClientService } from '../weblate-client.service';
import { projectsLanguagesRetrieve, type Language } from '../../client';

@Injectable()
export class WeblateLanguagesService {
  private readonly logger = new Logger(WeblateLanguagesService.name);

  constructor(private weblateClientService: WeblateClientService) {}

  async listLanguages(projectSlug: string): Promise<Language[]> {
    try {
      const client = this.weblateClientService.getClient();
      const response = await projectsLanguagesRetrieve({
        client,
        path: { slug: projectSlug }
      });
      
      // Handle different response formats
      const languages = response.data as any;
      
      if (Array.isArray(languages)) {
        return languages;
      }
      
      // If it's a paginated response
      if (languages && languages.results && Array.isArray(languages.results)) {
        return languages.results;
      }
      
      // If it's a single language, wrap it in an array
      if (languages && typeof languages === 'object') {
        return [languages];
      }
      
      return [];
    } catch (error) {
      this.logger.error(
        `Failed to list languages for project ${projectSlug}`,
        error,
      );
      throw new Error(`Failed to list languages: ${error.message}`);
    }
  }
} 