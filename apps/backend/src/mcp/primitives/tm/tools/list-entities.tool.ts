import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class ListEntitiesTool {
  private readonly logger = new Logger(ListEntitiesTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_list_entities',
    description:
      'List all entities in the TM diagram. Optionally filter by type (resource/event) and/or subtype (basic/recursive/correspondence).',
    parameters: z.object({
      type: z.enum(['resource', 'event']).optional().describe('Filter by entity type'),
      subtype: z
        .enum(['basic', 'recursive', 'correspondence'])
        .optional()
        .describe('Filter by entity subtype'),
    }),
  })
  async listEntities(input: any, context: Context) {
    try {
      if (!this.tmClient.isConnected()) {
        throw new Error(
          'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
        );
      }

      await context.reportProgress({ progress: 25, total: 100 });

      const entities = await this.tmClient.getEntities(input.type, input.subtype);

      await context.reportProgress({ progress: 100, total: 100 });

      this.logger.log(`Listed ${Array.isArray(entities) ? entities.length : 0} entities`);

      return {
        success: true,
        message: `Found ${Array.isArray(entities) ? entities.length : 0} entity(ies)`,
        entities,
      };
    } catch (error) {
      this.logger.error('Failed to list entities', error);
      throw error;
    }
  }
}
