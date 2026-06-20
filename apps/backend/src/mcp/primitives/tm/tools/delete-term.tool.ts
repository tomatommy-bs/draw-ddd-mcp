import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class DeleteTermTool {
  private readonly logger = new Logger(DeleteTermTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_delete_term',
    description: 'Delete a glossary term by name.',
    parameters: z.object({
      name: z.string().describe('Name of the term to delete'),
    }),
  })
  async deleteTerm(input: any, context: Context) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    await context.reportProgress({ progress: 10, total: 100 });

    const termsResponse = await this.tmClient.listTerms();
    const allTerms = termsResponse?.terms || [];
    const existing = allTerms.find((t: any) => t.name === input.name);
    if (!existing) {
      throw new Error(`Term "${input.name}" not found in glossary`);
    }

    await context.reportProgress({ progress: 50, total: 100 });

    this.logger.log(`Deleting glossary term: ${input.name}`);
    await this.tmClient.deleteTerm(existing.id);

    await context.reportProgress({ progress: 100, total: 100 });

    return {
      success: true,
      message: `Term "${input.name}" deleted from glossary`,
    };
  }
}
