import { DynamicModule, Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { TMModule } from '../../../tm/index.js';
import { AddResourceTool } from './tools/add-resource.tool.js';
import { AddEventTool } from './tools/add-event.tool.js';
import { UpdateEntityTool } from './tools/update-entity.tool.js';
import { DeleteEntityTool } from './tools/delete-entity.tool.js';
import { GetEntityTool } from './tools/get-entity.tool.js';
import { ListEntitiesTool } from './tools/list-entities.tool.js';
import { AddAttributeTool } from './tools/add-attribute.tool.js';
import { UpdateAttributeTool } from './tools/update-attribute.tool.js';
import { DeleteAttributeTool } from './tools/delete-attribute.tool.js';
import { SetIdentifierTool } from './tools/set-identifier.tool.js';
import { AddReferenceTool } from './tools/add-reference.tool.js';
import { UpdateReferenceTool } from './tools/update-reference.tool.js';
import { DeleteReferenceTool } from './tools/delete-reference.tool.js';
import { AddNoteTool } from './tools/add-note.tool.js';
import { UpdateNoteTool } from './tools/update-note.tool.js';
import { DeleteNoteTool } from './tools/delete-note.tool.js';
import { GetDiagramTool } from './tools/get-diagram.tool.js';
import { ImportDiagramTool } from './tools/import-diagram.tool.js';
import { ExportDiagramTool } from './tools/export-diagram.tool.js';
import { ValidateModelTool } from './tools/validate-model.tool.js';
import { AutoLayoutTool } from './tools/auto-layout.tool.js';
import { PromptUserTool } from './tools/prompt-user.tool.js';
import { AddTermTool } from './tools/add-term.tool.js';
import { UpdateTermTool } from './tools/update-term.tool.js';
import { DeleteTermTool } from './tools/delete-term.tool.js';
import { ListTermsTool } from './tools/list-terms.tool.js';

const MCP_PRIMITIVES = [
  AddResourceTool,
  AddEventTool,
  UpdateEntityTool,
  DeleteEntityTool,
  GetEntityTool,
  ListEntitiesTool,
  AddAttributeTool,
  UpdateAttributeTool,
  DeleteAttributeTool,
  SetIdentifierTool,
  AddReferenceTool,
  UpdateReferenceTool,
  DeleteReferenceTool,
  AddNoteTool,
  UpdateNoteTool,
  DeleteNoteTool,
  GetDiagramTool,
  ImportDiagramTool,
  ExportDiagramTool,
  ValidateModelTool,
  AutoLayoutTool,
  PromptUserTool,
  AddTermTool,
  UpdateTermTool,
  DeleteTermTool,
  ListTermsTool,
];

/**
 * MCP Primitives for TM Modeling
 */
@Module({})
export class McpPrimitivesTMModule {
  static forRoot(serverName: string): DynamicModule {
    return {
      module: McpPrimitivesTMModule,
      imports: [TMModule, McpModule.forFeature(MCP_PRIMITIVES, serverName)],
      providers: [...MCP_PRIMITIVES],
      exports: [TMModule, ...MCP_PRIMITIVES],
    };
  }
}

export * from './tools/add-resource.tool.js';
export * from './tools/add-event.tool.js';
export * from './tools/update-entity.tool.js';
export * from './tools/delete-entity.tool.js';
export * from './tools/get-entity.tool.js';
export * from './tools/list-entities.tool.js';
export * from './tools/add-attribute.tool.js';
export * from './tools/update-attribute.tool.js';
export * from './tools/delete-attribute.tool.js';
export * from './tools/set-identifier.tool.js';
export * from './tools/add-reference.tool.js';
export * from './tools/update-reference.tool.js';
export * from './tools/delete-reference.tool.js';
export * from './tools/add-note.tool.js';
export * from './tools/update-note.tool.js';
export * from './tools/delete-note.tool.js';
export * from './tools/get-diagram.tool.js';
export * from './tools/import-diagram.tool.js';
export * from './tools/export-diagram.tool.js';
export * from './tools/validate-model.tool.js';
export * from './tools/auto-layout.tool.js';
export * from './tools/prompt-user.tool.js';
export * from './tools/add-term.tool.js';
export * from './tools/update-term.tool.js';
export * from './tools/delete-term.tool.js';
export * from './tools/list-terms.tool.js';
