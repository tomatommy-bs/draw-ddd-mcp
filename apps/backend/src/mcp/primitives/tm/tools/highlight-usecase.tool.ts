import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class HighlightUsecaseTool {
  private readonly logger = new Logger(HighlightUsecaseTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_highlight_usecase',
    description:
      'Highlight entities and/or specific attributes involved in a use case. ' +
      'If attributeIds is omitted for a target, the entire entity is highlighted. ' +
      'If attributeIds is provided, only those attributes are highlighted.',
    parameters: z.object({
      usecaseName: z.string().describe('Name of the use case (e.g. "購入する")'),
      description: z.string().optional().describe('Brief description of the use case'),
      targets: z
        .array(
          z.object({
            entityId: z.string().describe('ID of the entity to highlight'),
            attributeIds: z
              .array(z.string())
              .optional()
              .describe('Specific attribute IDs to highlight. Omit to highlight the whole entity'),
          }),
        )
        .describe('Entities and optional attributes involved in this use case'),
    }),
  })
  async highlightUsecase(
    params: {
      usecaseName: string;
      description?: string;
      targets: Array<{ entityId: string; attributeIds?: string[] }>;
    },
    context: Context,
  ) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    await context.reportProgress({ progress: 0, total: 1 });

    this.logger.log(`Highlighting use case: ${params.usecaseName}`);
    await this.tmClient.setHighlight(params);

    await context.reportProgress({ progress: 1, total: 1 });

    return {
      success: true,
      message: `Use case "${params.usecaseName}" highlighted on ${params.targets.length} entity(s)`,
    };
  }

  @Tool({
    name: 'tm_clear_highlight',
    description: 'Clear all use case highlights from the diagram',
    parameters: z.object({}),
  })
  async clearHighlight(_params: Record<string, never>, context: Context) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    await context.reportProgress({ progress: 0, total: 1 });
    await this.tmClient.clearHighlight();
    await context.reportProgress({ progress: 1, total: 1 });

    return { success: true, message: 'Highlights cleared' };
  }

  @Tool({
    name: 'tm_activate_usecase',
    description: 'Activate a saved use case to show its highlights on the diagram',
    parameters: z.object({
      id: z.string().describe('ID of the use case to activate'),
    }),
  })
  async activateUsecase(params: { id: string }, context: Context) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }
    await this.tmClient.activateUsecase(params.id);
    return { success: true, message: `Use case "${params.id}" activated` };
  }

  @Tool({
    name: 'tm_delete_usecase',
    description: 'Delete a saved use case',
    parameters: z.object({
      id: z.string().describe('ID of the use case to delete'),
    }),
  })
  async deleteUsecase(params: { id: string }, context: Context) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }
    await this.tmClient.deleteUsecase(params.id);
    return { success: true, message: `Use case "${params.id}" deleted` };
  }

  @Tool({
    name: 'tm_list_usecases',
    description: 'List all saved use cases',
    parameters: z.object({}),
  })
  async listUsecases(_params: Record<string, never>, context: Context) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }
    const result = await this.tmClient.listUsecases();
    return { success: true, ...result };
  }
}
