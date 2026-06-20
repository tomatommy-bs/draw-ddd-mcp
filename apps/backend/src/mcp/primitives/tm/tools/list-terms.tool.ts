import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class ListTermsTool {
  private readonly logger = new Logger(ListTermsTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_list_terms',
    description: 'List all glossary terms in the ubiquitous language with their full data.',
    parameters: z.object({}),
  })
  async listTerms(_input: any, context: Context) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    await context.reportProgress({ progress: 25, total: 100 });

    const result = await this.tmClient.listTerms();
    const terms = result?.terms || [];

    await context.reportProgress({ progress: 100, total: 100 });

    this.logger.log(`Listed ${terms.length} glossary terms`);

    return {
      success: true,
      message: `Found ${terms.length} glossary term(s)`,
      terms,
    };
  }
}
