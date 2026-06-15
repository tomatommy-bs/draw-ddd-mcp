import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';
import { nanoid } from 'nanoid';

const AttributeSchema = z.object({
  name: z.string().describe('Attribute name'),
  dataType: z.string().describe('Data type of the attribute (e.g. string, number, date)'),
  isIdentifier: z.boolean().optional().default(false).describe('Whether this attribute is part of the identifier'),
  identifierOrder: z.number().nullable().optional().default(null).describe('Order within composite identifier'),
  isRequired: z.boolean().optional().default(false).describe('Whether the attribute is required'),
  default: z.string().optional().default('').describe('Default value'),
  comment: z.string().optional().default('').describe('Comment or description'),
});

@Injectable()
export class AddEventTool {
  private readonly logger = new Logger(AddEventTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_add_event',
    description:
      'Add an Event entity to the TM diagram. Events represent things that happen at a point in time (e.g. Purchase, Payment, Shipment).',
    parameters: z.object({
      name: z.string().describe('Name of the event entity'),
      subtype: z
        .enum(['basic', 'recursive', 'correspondence'])
        .optional()
        .default('basic')
        .describe('Entity subtype: basic (default), recursive (self-referencing), or correspondence (bridge/junction)'),
      attributes: z
        .array(AttributeSchema)
        .optional()
        .default([])
        .describe('List of attributes for this entity'),
      x: z.number().optional().describe('X position on the canvas'),
      y: z.number().optional().describe('Y position on the canvas'),
      color: z
        .string()
        .optional()
        .default('#dc2626')
        .describe('Color of the entity (hex color code)'),
      comment: z.string().optional().default('').describe('Comment or description for the entity'),
    }),
  })
  async addEvent(input: any, context: Context) {
    try {
      if (!this.tmClient.isConnected()) {
        throw new Error(
          'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
        );
      }

      await context.reportProgress({ progress: 10, total: 100 });

      const entityId = nanoid();
      const attributes = (input.attributes || []).map((attr: any) => ({
        id: nanoid(),
        name: attr.name,
        dataType: attr.dataType,
        isIdentifier: attr.isIdentifier ?? false,
        identifierOrder: attr.identifierOrder ?? null,
        isRequired: attr.isRequired ?? false,
        default: attr.default ?? '',
        comment: attr.comment ?? '',
      }));

      const entity = {
        id: entityId,
        name: input.name,
        type: 'event' as const,
        subtype: input.subtype || 'basic',
        color: input.color || '#dc2626',
        x: input.x ?? 0,
        y: input.y ?? 0,
        comment: input.comment || '',
        attributes,
      };

      await context.reportProgress({ progress: 50, total: 100 });

      this.logger.log(`Adding event entity: ${input.name} (${entityId})`);
      await this.tmClient.addEntity(entity);

      await context.reportProgress({ progress: 100, total: 100 });

      const attributeIds = attributes.map((a: any) => ({ name: a.name, id: a.id }));

      return {
        success: true,
        message: `Event "${input.name}" added successfully with ${attributes.length} attribute(s)`,
        entityId,
        attributeIds,
      };
    } catch (error) {
      this.logger.error('Failed to add event', error);
      throw error;
    }
  }
}
