import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseWeblateService } from './base-weblate.service';
import { WeblateProject } from '../../types';

@Injectable()
export class WeblateProjectsService extends BaseWeblateService {
  constructor(configService: ConfigService) {
    super(configService);
  }

  async listProjects(): Promise<WeblateProject[]> {
    try {
      const response = await this.apiClient.get('/projects/');

      // Check if response.data is an array directly (some APIs return array directly)
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Check if response.data.results exists (paginated response)
      if (response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }

      return [];
    } catch (error) {
      this.logger.error('Failed to list projects', error);
      throw new Error(`Failed to list projects: ${error.message}`);
    }
  }

  async getProject(projectSlug: string): Promise<WeblateProject> {
    try {
      const response = await this.apiClient.get(`/projects/${projectSlug}/`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get project ${projectSlug}`, error);
      throw new Error(`Failed to get project ${projectSlug}: ${error.message}`);
    }
  }
} 