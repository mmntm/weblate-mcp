import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { WeblateApiService } from '../services';
import { type Change } from '../client';

@Injectable()
export class WeblateChangesTool {
  private readonly logger = new Logger(WeblateChangesTool.name);

  constructor(private weblateApiService: WeblateApiService) {}

  @Tool({
    name: 'listRecentChanges',
    description: 'List recent changes across all projects in Weblate',
    parameters: z.object({
      limit: z.number().optional().describe('Number of changes to return (default: 20)').default(20),
      user: z.string().optional().describe('Filter by specific user'),
      timestampAfter: z.string().optional().describe('Show changes after this timestamp (ISO format)'),
      timestampBefore: z.string().optional().describe('Show changes before this timestamp (ISO format)'),
    }),
  })
  async listRecentChanges({
    limit = 20,
    user,
    timestampAfter,
    timestampBefore,
  }: {
    limit?: number;
    user?: string;
    timestampAfter?: string;
    timestampBefore?: string;
  }) {
    try {
      const result = await this.weblateApiService.listRecentChanges(
        limit,
        user,
        timestampAfter,
        timestampBefore,
      );

      if (result.results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No recent changes found.',
            },
          ],
        };
      }

      const changesList = result.results
        .slice(0, limit)
        .map(change => this.formatChangeResult(change))
        .join('\n\n---\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Found ${result.count} recent changes (showing ${Math.min(limit, result.results.length)}):\n\n${changesList}`,
          },
        ],
      };
    } catch (error) {
      this.logger.error('Failed to list recent changes', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error listing recent changes: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'getProjectChanges',
    description: 'Get recent changes for a specific project',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project'),
    }),
  })
  async getProjectChanges({ projectSlug }: { projectSlug: string }) {
    try {
      const result = await this.weblateApiService.getProjectChanges(projectSlug);

      if (result.results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No changes found for project "${projectSlug}".`,
            },
          ],
        };
      }

      const changesList = result.results
        .slice(0, 20)
        .map(change => this.formatChangeResult(change))
        .join('\n\n---\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Recent changes in project "${projectSlug}" (${result.count} total):\n\n${changesList}`,
          },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to get changes for project ${projectSlug}`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error getting changes for project "${projectSlug}": ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'getComponentChanges',
    description: 'Get recent changes for a specific component',
    parameters: z.object({
      projectSlug: z.string().describe('The slug of the project'),
      componentSlug: z.string().describe('The slug of the component'),
    }),
  })
  async getComponentChanges({
    projectSlug,
    componentSlug,
  }: {
    projectSlug: string;
    componentSlug: string;
  }) {
    try {
      const result = await this.weblateApiService.getComponentChanges(
        projectSlug,
        componentSlug,
      );

      if (result.results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No changes found for component "${componentSlug}" in project "${projectSlug}".`,
            },
          ],
        };
      }

      const changesList = result.results
        .slice(0, 20)
        .map(change => this.formatChangeResult(change))
        .join('\n\n---\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Recent changes in component "${componentSlug}" (${result.count} total):\n\n${changesList}`,
          },
        ],
      };
    } catch (error) {
      this.logger.error(
        `Failed to get changes for component ${componentSlug} in project ${projectSlug}`,
        error,
      );
      return {
        content: [
          {
            type: 'text',
            text: `Error getting changes for component "${componentSlug}": ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'getChangesByUser',
    description: 'Get recent changes by a specific user',
    parameters: z.object({
      user: z.string().describe('Username to filter by'),
      limit: z.number().optional().describe('Number of changes to return (default: 20)').default(20),
    }),
  })
  async getChangesByUser({
    user,
    limit = 20,
  }: {
    user: string;
    limit?: number;
  }) {
    try {
      const result = await this.weblateApiService.getChangesByUser(user, limit);

      if (result.results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No changes found for user "${user}".`,
            },
          ],
        };
      }

      const changesList = result.results
        .slice(0, limit)
        .map(change => this.formatChangeResult(change))
        .join('\n\n---\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Recent changes by user "${user}" (${result.count} total):\n\n${changesList}`,
          },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to get changes by user ${user}`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error getting changes by user "${user}": ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  private formatChangeResult(change: Change): string {
    const timestamp = change.timestamp ? new Date(change.timestamp).toLocaleString() : 'Unknown';
    const actionDescription = this.getActionDescription(change.action || 0);
    const user = change.user || 'Unknown user';
    const target = change.target || 'N/A';
    
    return `**${actionDescription}**\n**User:** ${user}\n**Time:** ${timestamp}\n**Target:** ${target}`;
  }

  private getActionDescription(action: number): string {
    const actionMap: Record<number, string> = {
      0: 'Resource updated',
      1: 'Translation completed',
      2: 'Translation changed',
      3: 'Comment added',
      4: 'Suggestion added',
      5: 'Translation added',
      6: 'Automatically translated',
      7: 'Suggestion accepted',
      8: 'Translation reverted',
      9: 'Translation uploaded',
      13: 'Source string added',
      14: 'Component locked',
      15: 'Component unlocked',
      17: 'Changes committed',
      18: 'Changes pushed',
      19: 'Repository reset',
      20: 'Repository merged',
      21: 'Repository rebased',
      22: 'Repository merge failed',
      23: 'Repository rebase failed',
      24: 'Parsing failed',
      25: 'Translation removed',
      26: 'Suggestion removed',
      27: 'Translation replaced',
      28: 'Repository push failed',
      29: 'Suggestion removed during clean-up',
      30: 'Source string changed',
      31: 'String added',
      32: 'Bulk status changed',
      33: 'Visibility changed',
      34: 'User added',
      35: 'User removed',
      36: 'Translation approved',
      37: 'Marked for edit',
      38: 'Component removed',
      39: 'Project removed',
      41: 'Project renamed',
      42: 'Component renamed',
      43: 'Moved component',
      45: 'Contributor joined',
      46: 'Announcement posted',
      47: 'Alert triggered',
      48: 'Language added',
      49: 'Language requested',
      50: 'Project created',
      51: 'Component created',
      52: 'User invited',
    };
    
    return actionMap[action] || `Unknown action (${action})`;
  }
} 