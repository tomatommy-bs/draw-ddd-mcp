import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class ExportDiagramTool {
  private readonly logger = new Logger(ExportDiagramTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_export_diagram',
    description: 'Export the current TM diagram as a JSON string',
    parameters: z.object({
      formatted: z.boolean().optional().default(false).describe('Whether to format the JSON with indentation'),
    }),
  })
  async exportDiagram(
    params: { formatted?: boolean },
    context: Context,
  ) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    await context.reportProgress({ progress: 0, total: 1 });

    this.logger.log('Exporting diagram');
    const diagram = await this.tmClient.getDiagram();

    const formatted = params.formatted ?? false;
    const json = formatted ? JSON.stringify(diagram, null, 2) : JSON.stringify(diagram);

    const entityCount = (diagram.entities ?? []).length;
    const referenceCount = (diagram.references ?? []).length;
    const noteCount = (diagram.notes ?? []).length;

    await context.reportProgress({ progress: 1, total: 1 });

    return {
      success: true,
      message: 'Diagram exported successfully',
      json,
      summary: {
        entityCount,
        referenceCount,
        noteCount,
      },
    };
  }
}
