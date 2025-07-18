import { Injectable, Logger } from '@nestjs/common';
import { WeblateClientService } from '../weblate-client.service';
import { 
  changesList, 
  projectsChangesRetrieve, 
  componentsChangesRetrieve,
  type Change,
  type PaginatedChangeList
} from '../../client';

@Injectable()
export class WeblateChangesService {
  private readonly logger = new Logger(WeblateChangesService.name);

  constructor(private weblateClientService: WeblateClientService) {}

  /**
   * Get recent changes across all projects
   */
  async listRecentChanges(
    limit: number = 50,
    user?: string,
    timestampAfter?: string,
    timestampBefore?: string
  ): Promise<{ results: Change[]; count: number; next?: string; previous?: string }> {
    try {
      const client = this.weblateClientService.getClient();
      
      const response = await changesList({
        client,
        query: {
          page_size: limit,
          ...(user && { user }),
          ...(timestampAfter && { timestamp_after: timestampAfter }),
          ...(timestampBefore && { timestamp_before: timestampBefore }),
        },
      });
      
      const changeList = response.data as PaginatedChangeList;
      
      return {
        results: changeList.results || [],
        count: changeList.count || 0,
        next: changeList.next || undefined,
        previous: changeList.previous || undefined,
      };
    } catch (error) {
      this.logger.error('Failed to list recent changes', error);
      throw new Error(`Failed to list recent changes: ${error.message}`);
    }
  }

  /**
   * Get changes for a specific project
   */
  async getProjectChanges(
    projectSlug: string
  ): Promise<{ results: Change[]; count: number; next?: string; previous?: string }> {
    try {
      const client = this.weblateClientService.getClient();
      
      const response = await projectsChangesRetrieve({
        client,
        path: { slug: projectSlug },
      });
      
      const changeList = response.data as any;
      
      // Handle different response formats
      if (Array.isArray(changeList)) {
        return {
          results: changeList,
          count: changeList.length,
        };
      }
      
      if (changeList && changeList.results) {
        return {
          results: changeList.results || [],
          count: changeList.count || 0,
          next: changeList.next || undefined,
          previous: changeList.previous || undefined,
        };
      }
      
      return { results: [], count: 0 };
    } catch (error) {
      this.logger.error(`Failed to get changes for project ${projectSlug}`, error);
      throw new Error(`Failed to get project changes: ${error.message}`);
    }
  }

  /**
   * Get changes for a specific component
   */
  async getComponentChanges(
    projectSlug: string,
    componentSlug: string
  ): Promise<{ results: Change[]; count: number; next?: string; previous?: string }> {
    try {
      const client = this.weblateClientService.getClient();
      
      const response = await componentsChangesRetrieve({
        client,
        path: { 
          project__slug: projectSlug,
          slug: componentSlug 
        },
      });
      
      const changeList = response.data as any;
      
      // Handle different response formats
      if (Array.isArray(changeList)) {
        return {
          results: changeList,
          count: changeList.length,
        };
      }
      
      if (changeList && changeList.results) {
        return {
          results: changeList.results || [],
          count: changeList.count || 0,
          next: changeList.next || undefined,
          previous: changeList.previous || undefined,
        };
      }
      
      return { results: [], count: 0 };
    } catch (error) {
      this.logger.error(
        `Failed to get changes for component ${componentSlug} in project ${projectSlug}`,
        error,
      );
      throw new Error(`Failed to get component changes: ${error.message}`);
    }
  }

  /**
   * Get changes by specific action type (action codes: 1=translation_completed, 2=translation_changed, etc.)
   */
  async getChangesByAction(
    actionCodes: number[],
    limit: number = 50
  ): Promise<{ results: Change[]; count: number; next?: string; previous?: string }> {
    try {
      const client = this.weblateClientService.getClient();
      
      const response = await changesList({
        client,
        query: {
          page_size: limit,
          action: actionCodes as any,
        },
      });
      
      const changeList = response.data as PaginatedChangeList;
      
      return {
        results: changeList.results || [],
        count: changeList.count || 0,
        next: changeList.next || undefined,
        previous: changeList.previous || undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to get changes by action ${actionCodes.join(',')}`, error);
      throw new Error(`Failed to get changes by action: ${error.message}`);
    }
  }

  /**
   * Get changes by specific user
   */
  async getChangesByUser(
    user: string,
    limit: number = 50
  ): Promise<{ results: Change[]; count: number; next?: string; previous?: string }> {
    try {
      return this.listRecentChanges(limit, user);
    } catch (error) {
      this.logger.error(`Failed to get changes by user ${user}`, error);
      throw new Error(`Failed to get changes by user: ${error.message}`);
    }
  }
} 