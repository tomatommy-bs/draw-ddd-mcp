import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';
import { nanoid } from 'nanoid';

@Injectable()
export class AddReferenceTool {
  private readonly logger = new Logger(AddReferenceTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_add_reference',
    description:
      'Add a reference between two entities in the TM diagram. References connect Resources and Events.',
    parameters: z.object({
      sourceEntityId: z.string().describe('The ID of the source entity'),
      targetEntityId: z.string().describe('The ID of the target entity'),
      sourceAttributeId: z
        .string()
        .optional()
        .describe('The ID of the source attribute to connect from'),
      targetAttributeId: z
        .string()
        .optional()
        .describe('The ID of the target attribute to connect to'),
      cardinality: z
        .enum(['1:1', '1:N', 'N:1'])
        .optional()
        .default('N:1')
        .describe('The cardinality of the reference'),
      label: z
        .string()
        .optional()
        .default('')
        .describe('A label for the reference'),
      comment: z
        .string()
        .optional()
        .default('')
        .describe('A comment for the reference'),
    }),
  })
  async run(
    params: {
      sourceEntityId: string;
      targetEntityId: string;
      sourceAttributeId?: string;
      targetAttributeId?: string;
      cardinality: '1:1' | '1:N' | 'N:1';
      label: string;
      comment: string;
    },
    context: Context,
  ) {
    this.logger.log(
      `Adding reference from ${params.sourceEntityId} to ${params.targetEntityId}`,
    );

    if (!this.tmClient.isConnected()) {
      return {
        success: false,
        message:
          'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      };
    }

    await context.reportProgress({ progress: 0, total: 100 });

    const referenceId = nanoid();

    const referenceData: Record<string, any> = {
      id: referenceId,
      sourceEntityId: params.sourceEntityId,
      targetEntityId: params.targetEntityId,
      cardinality: params.cardinality,
      label: params.label,
      comment: params.comment,
    };

    if (params.sourceAttributeId) {
      referenceData.sourceAttributeId = params.sourceAttributeId;
    }

    if (params.targetAttributeId) {
      referenceData.targetAttributeId = params.targetAttributeId;
    }

    await context.reportProgress({ progress: 50, total: 100 });

    await this.tmClient.addReference(referenceData, true);

    await context.reportProgress({ progress: 100, total: 100 });

    return {
      success: true,
      message: `Reference added from ${params.sourceEntityId} to ${params.targetEntityId}`,
      referenceId,
    };
  }
}
