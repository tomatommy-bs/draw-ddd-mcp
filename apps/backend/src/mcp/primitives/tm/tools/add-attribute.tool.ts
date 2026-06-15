import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';
import { nanoid } from 'nanoid';

@Injectable()
export class AddAttributeTool {
  private readonly logger = new Logger(AddAttributeTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_add_attribute',
    description:
      'Add an attribute to an existing entity in the TM diagram. Specify the entity ID, attribute name, data type, and optional properties like identifier status and default value.',
    parameters: z.object({
      entityId: z.string().describe('The ID of the entity to add the attribute to'),
      name: z.string().describe('The name of the attribute'),
      dataType: z.string().default('VARCHAR').describe('The data type of the attribute'),
      isIdentifier: z
        .boolean()
        .optional()
        .default(false)
        .describe('Whether this attribute is part of the entity identifier'),
      identifierOrder: z
        .number()
        .nullable()
        .optional()
        .describe('The order of this attribute in a composite identifier (null if not an identifier)'),
      isRequired: z
        .boolean()
        .optional()
        .default(false)
        .describe('Whether this attribute is required (NOT NULL)'),
      default: z.string().optional().default('').describe('The default value for the attribute'),
      comment: z.string().optional().default('').describe('A comment or description for the attribute'),
    }),
  })
  async run(
    params: {
      entityId: string;
      name: string;
      dataType: string;
      isIdentifier: boolean;
      identifierOrder?: number | null;
      isRequired: boolean;
      default: string;
      comment: string;
    },
    context: Context,
  ) {
    this.logger.log(`Adding attribute "${params.name}" to entity ${params.entityId}`);

    if (!this.tmClient.isConnected()) {
      return {
        success: false,
        message:
          'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      };
    }

    await context.reportProgress({ progress: 0, total: 1 });

    const attributeId = nanoid();

    const attributeData = {
      id: attributeId,
      name: params.name,
      dataType: params.dataType,
      isIdentifier: params.isIdentifier,
      identifierOrder: params.identifierOrder ?? null,
      isRequired: params.isRequired,
      default: params.default,
      comment: params.comment,
    };

    try {
      await this.tmClient.addAttribute(params.entityId, attributeData);

      await context.reportProgress({ progress: 1, total: 1 });

      return {
        success: true,
        message: `Attribute "${params.name}" added to entity ${params.entityId}`,
        attributeId,
        entityId: params.entityId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to add attribute: ${errorMessage}`);
      return {
        success: false,
        message: `Failed to add attribute: ${errorMessage}`,
        attributeId,
        entityId: params.entityId,
      };
    }
  }
}
