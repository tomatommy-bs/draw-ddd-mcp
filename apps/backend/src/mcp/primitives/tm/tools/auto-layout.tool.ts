import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class AutoLayoutTool {
  private readonly logger = new Logger(AutoLayoutTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_auto_layout',
    description: 'Auto-layout the TM diagram. Resources are placed at the top, Events at the bottom.',
    parameters: z.object({
      strategy: z
        .enum(['standard', 'flow', 'compact'])
        .optional()
        .default('standard')
        .describe('The layout strategy to use'),
    }),
  })
  async autoLayout(
    params: { strategy?: 'standard' | 'flow' | 'compact' },
    context: Context,
  ) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    await context.reportProgress({ progress: 0, total: 1 });

    const strategy = params.strategy ?? 'standard';
    this.logger.log(`Auto-layouting diagram with strategy: ${strategy}`);
    await this.tmClient.autoLayout(strategy);

    await context.reportProgress({ progress: 1, total: 1 });

    return {
      success: true,
      message: `Diagram auto-layout completed with '${strategy}' strategy`,
    };
  }
}
