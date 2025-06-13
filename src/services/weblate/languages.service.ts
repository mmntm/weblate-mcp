import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseWeblateService } from './base-weblate.service';
import { WeblateLanguage } from '../../types';

@Injectable()
export class WeblateLanguagesService extends BaseWeblateService {
  constructor(configService: ConfigService) {
    super(configService);
  }

  async listLanguages(projectSlug: string): Promise<WeblateLanguage[]> {
    try {
      const response = await this.apiClient.get(
        `/projects/${projectSlug}/languages/`,
      );
      // Languages endpoint returns array directly, not paginated
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      this.logger.error(
        `Failed to list languages for project ${projectSlug}`,
        error,
      );
      throw new Error(`Failed to list languages: ${error.message}`);
    }
  }
} 