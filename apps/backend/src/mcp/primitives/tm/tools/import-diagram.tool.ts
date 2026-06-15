import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class ImportDiagramTool {
  private readonly logger = new Logger(ImportDiagramTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_import_diagram',
    description: 'Import a TM diagram from a JSON string',
    parameters: z.object({
      json: z.string().describe('The TMDiagram JSON string to import'),
      clearCurrent: z.boolean().optional().default(true).describe('Whether to clear the current diagram before importing'),
    }),
  })
  async importDiagram(
    params: { json: string; clearCurrent?: boolean },
    context: Context,
  ) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    await context.reportProgress({ progress: 0, total: 2 });

    let diagram: unknown;
    try {
      diagram = JSON.parse(params.json);
    } catch {
      throw new Error('Invalid JSON string. Please provide a valid JSON representation of a TMDiagram.');
    }

    if (typeof diagram !== 'object' || diagram === null || Array.isArray(diagram)) {
      throw new Error('Invalid diagram format. The JSON must represent an object.');
    }

    await context.reportProgress({ progress: 1, total: 2 });

    const clearCurrent = params.clearCurrent ?? true;
    this.logger.log(`Importing diagram (clearCurrent: ${clearCurrent})`);
    await this.tmClient.importDiagram(diagram, clearCurrent);

    const diagramObj = diagram as Record<string, any>;
    const entityCount = (diagramObj.entities ?? []).length;
    const referenceCount = (diagramObj.references ?? []).length;
    const noteCount = (diagramObj.notes ?? []).length;

    await context.reportProgress({ progress: 2, total: 2 });

    return {
      success: true,
      message: 'Diagram imported successfully',
      imported: {
        entityCount,
        referenceCount,
        noteCount,
      },
    };
  }
}
