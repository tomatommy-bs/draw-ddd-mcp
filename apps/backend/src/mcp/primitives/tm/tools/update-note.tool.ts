import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class UpdateNoteTool {
  private readonly logger = new Logger(UpdateNoteTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_update_note',
    description: 'Update an existing note in the TM diagram',
    parameters: z.object({
      noteId: z.string().describe('The ID of the note to update'),
      content: z.string().optional().describe('Updated text content of the note'),
      x: z.number().optional().describe('Updated X position'),
      y: z.number().optional().describe('Updated Y position'),
      width: z.number().optional().describe('Updated width'),
      height: z.number().optional().describe('Updated height'),
      color: z.string().optional().describe('Updated background color'),
    }),
  })
  async updateNote(
    params: { noteId: string; content?: string; x?: number; y?: number; width?: number; height?: number; color?: string },
    context: Context,
  ) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    await context.reportProgress({ progress: 0, total: 1 });

    const updates: Record<string, unknown> = {};
    if (params.content !== undefined) updates.content = params.content;
    if (params.x !== undefined) updates.x = params.x;
    if (params.y !== undefined) updates.y = params.y;
    if (params.width !== undefined) updates.width = params.width;
    if (params.height !== undefined) updates.height = params.height;
    if (params.color !== undefined) updates.color = params.color;

    this.logger.log(`Updating note: ${params.noteId}`);
    await this.tmClient.updateNote(params.noteId, updates);

    await context.reportProgress({ progress: 1, total: 1 });

    return {
      success: true,
      message: `Note ${params.noteId} updated successfully`,
    };
  }
}
