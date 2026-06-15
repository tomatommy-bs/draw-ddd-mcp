import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';
import { nanoid } from 'nanoid';

@Injectable()
export class AddNoteTool {
  private readonly logger = new Logger(AddNoteTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_add_note',
    description: 'Add a note to the TM diagram',
    parameters: z.object({
      content: z.string().describe('The text content of the note'),
      x: z.number().optional().describe('X position of the note'),
      y: z.number().optional().describe('Y position of the note'),
      width: z.number().optional().default(240).describe('Width of the note'),
      height: z.number().optional().default(120).describe('Height of the note'),
      color: z.string().optional().default('#ffd93d').describe('Background color of the note'),
    }),
  })
  async addNote(
    params: { content: string; x?: number; y?: number; width?: number; height?: number; color?: string },
    context: Context,
  ) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    await context.reportProgress({ progress: 0, total: 1 });

    const noteId = nanoid();
    const noteData = {
      id: noteId,
      content: params.content,
      x: params.x ?? 100,
      y: params.y ?? 100,
      width: params.width ?? 240,
      height: params.height ?? 120,
      color: params.color || '#ffd93d',
    };

    this.logger.log(`Adding note: ${noteId}`);
    await this.tmClient.addNote(noteData, true);

    await context.reportProgress({ progress: 1, total: 1 });

    return {
      success: true,
      message: 'Note added successfully',
      noteId,
    };
  }
}
