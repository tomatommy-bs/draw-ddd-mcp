import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class GetDiagramTool {
  private readonly logger = new Logger(GetDiagramTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_get_diagram',
    description:
      'Get the current TM diagram. Use detail="summary" for an overview (entity names, attribute counts) or detail="full" to include all attributes with identifierType/referenceId fields.',
    parameters: z.object({
      detail: z
        .enum(['summary', 'full'])
        .optional()
        .default('summary')
        .describe('Level of detail: "summary" for overview, "full" for complete structure including all attributes'),
    }),
  })
  async getDiagram(
    params: { detail: 'summary' | 'full' },
    context: Context,
  ) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    await context.reportProgress({ progress: 0, total: 1 });

    this.logger.log(`Getting diagram (detail: ${params.detail})`);
    const diagram = await this.tmClient.getDiagram();

    await context.reportProgress({ progress: 1, total: 1 });

    if (params.detail === 'full') {
      return {
        success: true,
        message: 'Full diagram retrieved successfully',
        entityCount: (diagram.entities ?? []).length,
        referenceCount: (diagram.references ?? []).length,
        noteCount: (diagram.notes ?? []).length,
        entities: diagram.entities ?? [],
        references: diagram.references ?? [],
        notes: diagram.notes ?? [],
      };
    }

    const entities = (diagram.entities ?? []).map((e: any) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      subtype: e.subtype,
      attributeCount: (e.attributes ?? []).length,
    }));

    const references = (diagram.references ?? []).map((r: any) => ({
      id: r.id,
      cardinality: r.cardinality,
      sourceEntityId: r.sourceEntityId,
      targetEntityId: r.targetEntityId,
    }));

    const notes = (diagram.notes ?? []).map((n: any) => ({
      id: n.id,
      content: n.content?.substring(0, 100) ?? '',
    }));

    return {
      success: true,
      message: 'Diagram summary retrieved successfully',
      entityCount: entities.length,
      referenceCount: references.length,
      noteCount: notes.length,
      entities,
      references,
      notes,
    };
  }
}
