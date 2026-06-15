import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class UpdateReferenceTool {
  private readonly logger = new Logger(UpdateReferenceTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_update_reference',
    description: 'Update properties of an existing reference.',
    parameters: z.object({
      referenceId: z.string().describe('The ID of the reference to update'),
      cardinality: z
        .enum(['1:1', '1:N', 'N:1'])
        .optional()
        .describe('The updated cardinality of the reference'),
      label: z
        .string()
        .optional()
        .describe('The updated label for the reference'),
      comment: z
        .string()
        .optional()
        .describe('The updated comment for the reference'),
    }),
  })
  async run(
    params: {
      referenceId: string;
      cardinality?: '1:1' | '1:N' | 'N:1';
      label?: string;
      comment?: string;
    },
    context: Context,
  ) {
    this.logger.log(`Updating reference ${params.referenceId}`);

    if (!this.tmClient.isConnected()) {
      return {
        success: false,
        message:
          'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      };
    }

    await context.reportProgress({ progress: 0, total: 100 });

    const updates: Record<string, any> = {};

    if (params.cardinality !== undefined) {
      updates.cardinality = params.cardinality;
    }

    if (params.label !== undefined) {
      updates.label = params.label;
    }

    if (params.comment !== undefined) {
      updates.comment = params.comment;
    }

    await context.reportProgress({ progress: 50, total: 100 });

    await this.tmClient.updateReference(params.referenceId, updates);

    await context.reportProgress({ progress: 100, total: 100 });

    return {
      success: true,
      message: `Reference ${params.referenceId} updated`,
      referenceId: params.referenceId,
      updates,
    };
  }
}
