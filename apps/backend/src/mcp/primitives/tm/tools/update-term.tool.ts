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
export class UpdateTermTool {
  private readonly logger = new Logger(UpdateTermTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_update_term',
    description: 'Update an existing glossary term. Identify the term by its current name.',
    parameters: z.object({
      name: z.string().describe('Current name of the term to update'),
      newName: z.string().optional().describe('New name for the term'),
      definition: z.string().optional().describe('New definition text with [[R:name]]/[[E:name]] references'),
      context: z.string().optional().describe('New usage context'),
      rejected: z.array(RejectedSchema).optional().describe('Replace the rejected alternatives list'),
      entityRef: z
        .string()
        .nullable()
        .optional()
        .describe('Entity name to link to (resolved to ID), or null to unlink'),
    }),
  })
  async updateTerm(input: any, context: Context) {
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

    await context.reportProgress({ progress: 30, total: 100 });

    const updates: any = {};
    if (input.newName !== undefined) updates.name = input.newName;
    if (input.definition !== undefined) updates.definition = input.definition;
    if (input.context !== undefined) updates.context = input.context;
    if (input.rejected !== undefined) updates.rejected = input.rejected;

    if (input.entityRef !== undefined) {
      if (input.entityRef === null) {
        updates.entityRef = null;
      } else {
        const entities = await this.tmClient.getEntities();
        const found = (Array.isArray(entities) ? entities : []).find(
          (e: any) => e.name === input.entityRef,
        );
        if (!found) {
          throw new Error(`Entity "${input.entityRef}" not found in the TM diagram`);
        }
        updates.entityRef = found.id;
      }
    }

    await context.reportProgress({ progress: 60, total: 100 });

    this.logger.log(`Updating glossary term: ${input.name}`);
    const term = await this.tmClient.updateTerm(existing.id, updates);

    await context.reportProgress({ progress: 100, total: 100 });

    return {
      success: true,
      message: `Term "${input.name}" updated`,
      term,
    };
  }
}
