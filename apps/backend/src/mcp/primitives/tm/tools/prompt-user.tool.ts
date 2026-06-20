import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class PromptUserTool {
  private readonly logger = new Logger(PromptUserTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_prompt_user',
    description:
      'Show a prompt/wizard in the browser GUI and wait for the user to respond. ' +
      'Use this to ask the user questions via the visual interface. ' +
      'Supports select (pick from options), text (free-form input), and confirm (yes/no).',
    parameters: z.object({
      title: z.string().describe('Title of the prompt dialog'),
      message: z.string().describe('Message or question to show the user'),
      type: z
        .enum(['select', 'text', 'confirm'])
        .describe('Type of prompt: select (pick from options), text (free input), confirm (yes/no)'),
      options: z
        .array(z.string())
        .optional()
        .describe('Options for select type. Ignored for text/confirm.'),
    }),
  })
  async promptUser(
    params: { title: string; message: string; type: 'select' | 'text' | 'confirm'; options?: string[] },
    context: Context,
  ) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    this.logger.log(`Prompting user: ${params.title} (${params.type})`);
    await context.reportProgress({ progress: 0, total: 1 });

    const response = await this.tmClient.promptUser(params);

    await context.reportProgress({ progress: 1, total: 1 });

    return {
      success: true,
      userResponse: response,
    };
  }
}
