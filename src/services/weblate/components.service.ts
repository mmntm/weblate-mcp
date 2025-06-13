import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseWeblateService } from './base-weblate.service';
import { WeblateComponent } from '../../types';

@Injectable()
export class WeblateComponentsService extends BaseWeblateService {
  constructor(configService: ConfigService) {
    super(configService);
  }

  async listComponents(projectSlug: string): Promise<WeblateComponent[]> {
    try {
      const response = await this.apiClient.get(
        `/projects/${projectSlug}/components/`,
      );
      return response.data.results || [];
    } catch (error) {
      this.logger.error(
        `Failed to list components for project ${projectSlug}`,
        error,
      );
      throw new Error(`Failed to list components: ${error.message}`);
    }
  }
} 