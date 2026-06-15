import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class UpdateEntityTool {
  private readonly logger = new Logger(UpdateEntityTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_update_entity',
    description:
      'Update properties of an existing entity (Resource or Event) in the TM diagram. Only the provided fields will be updated.',
    parameters: z.object({
      entityId: z.string().describe('ID of the entity to update'),
      name: z.string().optional().describe('New name for the entity'),
      type: z.enum(['resource', 'event']).optional().describe('Change entity type'),
      subtype: z
        .enum(['basic', 'recursive', 'correspondence'])
        .optional()
        .describe('Change entity subtype'),
      x: z.number().optional().describe('New X position on the canvas'),
      y: z.number().optional().describe('New Y position on the canvas'),
      color: z.string().optional().describe('New color (hex color code)'),
      comment: z.string().optional().describe('New comment or description'),
    }),
  })
  async updateEntity(input: any, context: Context) {
    try {
      if (!this.tmClient.isConnected()) {
        throw new Error(
          'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
        );
      }

      await context.reportProgress({ progress: 10, total: 100 });

      const updates: Record<string, any> = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.type !== undefined) updates.type = input.type;
      if (input.subtype !== undefined) updates.subtype = input.subtype;
      if (input.x !== undefined) updates.x = input.x;
      if (input.y !== undefined) updates.y = input.y;
      if (input.color !== undefined) updates.color = input.color;
      if (input.comment !== undefined) updates.comment = input.comment;

      await context.reportProgress({ progress: 50, total: 100 });

      await this.tmClient.updateEntity(input.entityId, updates);

      await context.reportProgress({ progress: 100, total: 100 });

      this.logger.log(`Entity ${input.entityId} updated successfully`);

      return {
        success: true,
        message: `Entity ${input.entityId} updated successfully`,
        entityId: input.entityId,
        updates,
      };
    } catch (error) {
      this.logger.error('Failed to update entity', error);
      throw error;
    }
  }
}
