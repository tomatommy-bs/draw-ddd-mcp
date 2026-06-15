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
    description: 'Get a summary of the current TM diagram including entities, references, and notes',
    parameters: z.object({}),
  })
  async getDiagram(
    _params: Record<string, never>,
    context: Context,
  ) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    await context.reportProgress({ progress: 0, total: 1 });

    this.logger.log('Getting diagram summary');
    const diagram = await this.tmClient.getDiagram();

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

    await context.reportProgress({ progress: 1, total: 1 });

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
