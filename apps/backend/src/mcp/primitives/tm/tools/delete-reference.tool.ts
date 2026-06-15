import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class DeleteReferenceTool {
  private readonly logger = new Logger(DeleteReferenceTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_delete_reference',
    description: 'Delete a reference from the diagram.',
    parameters: z.object({
      referenceId: z.string().describe('The ID of the reference to delete'),
    }),
  })
  async run(
    params: {
      referenceId: string;
    },
    context: Context,
  ) {
    this.logger.log(`Deleting reference ${params.referenceId}`);

    if (!this.tmClient.isConnected()) {
      return {
        success: false,
        message:
          'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      };
    }

    await context.reportProgress({ progress: 0, total: 100 });

    await this.tmClient.deleteReference(params.referenceId);

    await context.reportProgress({ progress: 100, total: 100 });

    return {
      success: true,
      message: `Reference ${params.referenceId} deleted`,
      referenceId: params.referenceId,
    };
  }
}
