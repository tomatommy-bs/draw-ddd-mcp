import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class DeleteNoteTool {
  private readonly logger = new Logger(DeleteNoteTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_delete_note',
    description: 'Delete a note from the TM diagram',
    parameters: z.object({
      noteId: z.string().describe('The ID of the note to delete'),
    }),
  })
  async deleteNote(
    params: { noteId: string },
    context: Context,
  ) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    await context.reportProgress({ progress: 0, total: 1 });

    this.logger.log(`Deleting note: ${params.noteId}`);
    await this.tmClient.deleteNote(params.noteId);

    await context.reportProgress({ progress: 1, total: 1 });

    return {
      success: true,
      message: `Note ${params.noteId} deleted successfully`,
    };
  }
}
