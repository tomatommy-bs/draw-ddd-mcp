import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

const RejectedSchema = z.object({
  term: z.string().describe('The rejected alternative term'),
  reason: z.string().describe('Why this alternative was rejected'),
});

@Injectable()
export class AddTermTool {
  private readonly logger = new Logger(AddTermTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_add_term',
    description:
      'Add a glossary term to the ubiquitous language. Terms can optionally be linked to a TM entity by name.',
    parameters: z.object({
      name: z.string().describe('The term name (e.g. "受注")'),
      definition: z
        .string()
        .describe(
          'Definition text. Use [[R:name]] and [[E:name]] to reference TM entities (e.g. "[[R:顧客]] が商品を注文し...")',
        ),
      context: z.string().optional().default('').describe('Usage context (e.g. "営業チームの業務フロー")'),
      rejected: z
        .array(RejectedSchema)
        .optional()
        .default([])
        .describe('Rejected alternative terms with reasons'),
      entityRef: z
        .string()
        .optional()
        .describe('Name of the TM entity this term directly corresponds to. Will be resolved to entity ID.'),
    }),
  })
  async addTerm(input: any, context: Context) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    await context.reportProgress({ progress: 10, total: 100 });

    let entityRef: string | null = null;
    if (input.entityRef) {
      const entities = await this.tmClient.getEntities();
      const found = (Array.isArray(entities) ? entities : []).find(
        (e: any) => e.name === input.entityRef,
      );
      if (!found) {
        throw new Error(`Entity "${input.entityRef}" not found in the TM diagram`);
      }
      entityRef = found.id;
    }

    await context.reportProgress({ progress: 50, total: 100 });

    const termData = {
      name: input.name,
      definition: input.definition,
      context: input.context || '',
      rejected: input.rejected || [],
      entityRef,
    };

    this.logger.log(`Adding glossary term: ${input.name}`);
    const term = await this.tmClient.addTerm(termData);

    await context.reportProgress({ progress: 100, total: 100 });

    return {
      success: true,
      message: `Term "${input.name}" added to glossary`,
      term,
    };
  }
}
