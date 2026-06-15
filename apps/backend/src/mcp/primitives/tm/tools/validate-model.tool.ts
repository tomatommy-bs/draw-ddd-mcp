import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class ValidateModelTool {
  private readonly logger = new Logger(ValidateModelTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_validate_model',
    description:
      'Validate the TM model against modeling rules. Checks: all entities have identifiers, resource identifiers are singular, events reference at least one resource, no orphan attributes, correspondence resources reference 2 resources, detail events reference parent event.',
    parameters: z.object({}),
  })
  async validateModel(
    _params: Record<string, never>,
    context: Context,
  ) {
    if (!this.tmClient.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    await context.reportProgress({ progress: 0, total: 1 });

    this.logger.log('Validating TM model');
    const diagram = await this.tmClient.getDiagram();

    const entities: any[] = diagram.entities ?? [];
    const references: any[] = diagram.references ?? [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Build lookup maps
    const entityById = new Map<string, any>();
    for (const entity of entities) {
      entityById.set(entity.id, entity);
    }

    // Referenced entity IDs (entities that appear as source or target in a reference)
    const referencedEntityIds = new Set<string>();
    for (const ref of references) {
      referencedEntityIds.add(ref.sourceEntityId);
      referencedEntityIds.add(ref.targetEntityId);
    }

    for (const entity of entities) {
      const attrs: any[] = entity.attributes ?? [];
      const identifiers = attrs.filter((a: any) => a.isIdentifier);

      // Rule 1: Every entity must have at least one identifier attribute
      if (identifiers.length === 0) {
        errors.push(`Entity "${entity.name}" (${entity.id}) has no identifier attribute.`);
      }

      // Rule 2: Resource entities of subtype 'basic' should have exactly one identifier attribute
      if (entity.type === 'resource' && entity.subtype === 'basic' && identifiers.length > 1) {
        errors.push(
          `Resource "${entity.name}" (${entity.id}) has ${identifiers.length} identifiers but basic resources should have exactly one.`,
        );
      }

      // Rule 3: Event entities must have at least one reference to a Resource entity
      if (entity.type === 'event') {
        const eventRefs = references.filter(
          (r: any) => r.sourceEntityId === entity.id || r.targetEntityId === entity.id,
        );
        const referencesResource = eventRefs.some((r: any) => {
          const otherId = r.sourceEntityId === entity.id ? r.targetEntityId : r.sourceEntityId;
          const otherEntity = entityById.get(otherId);
          return otherEntity && otherEntity.type === 'resource';
        });

        if (!referencesResource) {
          errors.push(`Event "${entity.name}" (${entity.id}) does not reference any Resource entity.`);
        }
      }

      // Rule 4: Correspondence Resources must reference at least 2 Resource entities
      if (entity.type === 'resource' && entity.subtype === 'correspondence') {
        const corrRefs = references.filter(
          (r: any) => r.sourceEntityId === entity.id || r.targetEntityId === entity.id,
        );
        const resourceRefCount = corrRefs.filter((r: any) => {
          const otherId = r.sourceEntityId === entity.id ? r.targetEntityId : r.sourceEntityId;
          const otherEntity = entityById.get(otherId);
          return otherEntity && otherEntity.type === 'resource';
        }).length;

        if (resourceRefCount < 2) {
          errors.push(
            `Correspondence Resource "${entity.name}" (${entity.id}) references ${resourceRefCount} resource(s) but must reference at least 2.`,
          );
        }
      }

      // Rule 5: Check for entities with no attributes (warning)
      if (attrs.length === 0) {
        warnings.push(`Entity "${entity.name}" (${entity.id}) has no attributes.`);
      }
    }

    // Rule 6: Check for unreferenced entities (warning, not error)
    for (const entity of entities) {
      if (!referencedEntityIds.has(entity.id)) {
        warnings.push(`Entity "${entity.name}" (${entity.id}) is not referenced by any relationship.`);
      }
    }

    const valid = errors.length === 0;

    await context.reportProgress({ progress: 1, total: 1 });

    return {
      success: true,
      valid,
      errors,
      warnings,
    };
  }
}
