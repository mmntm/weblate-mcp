import { Injectable, Logger } from '@nestjs/common';
import { WeblateClientService } from '../weblate-client.service';
import { projectsList, projectsRetrieve, type Project } from '../../client';

@Injectable()
export class WeblateProjectsService {
  private readonly logger = new Logger(WeblateProjectsService.name);

  constructor(private weblateClientService: WeblateClientService) {}

  async listProjects(): Promise<Project[]> {
    try {
      const client = this.weblateClientService.getClient();
      const response = await projectsList({ client });

      // The generated client returns the response with data field
      const projects = response.data;

      // Check if response.data is an array directly (some APIs return array directly)
      if (Array.isArray(projects)) {
        return projects;
      }

      // Check if response.data.results exists (paginated response)
      if (projects && Array.isArray(projects.results)) {
        return projects.results;
      }

      return [];
    } catch (error) {
      this.logger.error('Failed to list projects', error);
      throw new Error(`Failed to list projects: ${error.message}`);
    }
  }

  async getProject(projectSlug: string): Promise<Project> {
    try {
      const client = this.weblateClientService.getClient();
      const response = await projectsRetrieve({ 
        client,
        path: { slug: projectSlug }
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get project ${projectSlug}`, error);
      throw new Error(`Failed to get project ${projectSlug}: ${error.message}`);
    }
  }
} 