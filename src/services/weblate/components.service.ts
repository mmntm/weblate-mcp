import { Injectable, Logger } from '@nestjs/common';
import { WeblateClientService } from '../weblate-client.service';
import { projectsComponentsRetrieve, type Component } from '../../client';

@Injectable()
export class WeblateComponentsService {
  private readonly logger = new Logger(WeblateComponentsService.name);

  constructor(private weblateClientService: WeblateClientService) {}

  async listComponents(projectSlug: string): Promise<Component[]> {
    try {
      const client = this.weblateClientService.getClient();
      const response = await projectsComponentsRetrieve({
        client,
        path: { slug: projectSlug }
      });
      
      // According to the API comment, this should return a list of components
      // The typing might be incorrect - try to handle both single and array responses
      const components = response.data as any;
      
      if (Array.isArray(components)) {
        return components;
      }
      
      // If it's a paginated response
      if (components && components.results && Array.isArray(components.results)) {
        return components.results;
      }
      
      // If it's a single component, wrap it in an array
      if (components && typeof components === 'object') {
        return [components];
      }
      
      return [];
    } catch (error) {
      this.logger.error(
        `Failed to list components for project ${projectSlug}`,
        error,
      );
      throw new Error(`Failed to list components: ${error.message}`);
    }
  }
} 