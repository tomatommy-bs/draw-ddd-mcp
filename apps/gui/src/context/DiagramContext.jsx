import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { nanoid } from "nanoid";

const DiagramContext = createContext(null);

export function useDiagram() {
  const ctx = useContext(DiagramContext);
  if (!ctx) throw new Error("useDiagram must be used within DiagramProvider");
  return ctx;
}

const DEFAULT_RESOURCE_COLOR = "#3b82f6";
const DEFAULT_EVENT_COLOR = "#eab308";
const DEFAULT_NOTE_COLOR = "#fbbf24";

function makeEntity(overrides = {}) {
  const id = overrides.id || nanoid();
  return {
    id,
    name: overrides.name || "Untitled",
    type: overrides.type || "resource",
    subtype: overrides.subtype || "basic",
    color: overrides.color || (overrides.type === "event" ? DEFAULT_EVENT_COLOR : DEFAULT_RESOURCE_COLOR),
    x: overrides.x ?? 100,
    y: overrides.y ?? 100,
    comment: overrides.comment || "",
    attributes: overrides.attributes || [],
  };
}

function makeAttribute(overrides = {}) {
  const id = overrides.id || nanoid();
  const isIdentifier = overrides.isIdentifier || false;
  return {
    id,
    name: overrides.name || "new_attr",
    dataType: overrides.dataType || "string",
    isIdentifier,
    identifierType: overrides.identifierType ?? (isIdentifier ? "own" : null),
    referenceId: overrides.referenceId ?? null,
    identifierOrder: overrides.identifierOrder ?? null,
    isRequired: overrides.isRequired ?? false,
    default: overrides.default || "",
    comment: overrides.comment || "",
  };
}

function makeReference(overrides = {}) {
  const id = overrides.id || nanoid();
  return {
    id,
    sourceEntityId: overrides.sourceEntityId || "",
    targetEntityId: overrides.targetEntityId || "",
    sourceAttributeId: overrides.sourceAttributeId || null,
    targetAttributeId: overrides.targetAttributeId || null,
    cardinality: overrides.cardinality || "1:N",
    label: overrides.label || "",
    comment: overrides.comment || "",
  };
}

function makeNote(overrides = {}) {
  const id = overrides.id || nanoid();
  return {
    id,
    content: overrides.content || "",
    x: overrides.x ?? 200,
    y: overrides.y ?? 200,
    width: overrides.width ?? 200,
    height: overrides.height ?? 120,
    color: overrides.color || DEFAULT_NOTE_COLOR,
  };
}

function makeTerm(overrides = {}) {
  const id = overrides.id || nanoid();
  return {
    id,
    name: overrides.name || "",
    definition: overrides.definition || "",
    context: overrides.context || "",
    rejected: overrides.rejected || [],
    entityRef: overrides.entityRef ?? null,
  };
}

export function DiagramProvider({ children }) {
  const [entities, setEntities] = useState([]);
  const [references, setReferences] = useState([]);
  const [notes, setNotes] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Use refs so WS callbacks always see latest state
  const entitiesRef = useRef(entities);
  entitiesRef.current = entities;
  const referencesRef = useRef(references);
  referencesRef.current = references;
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const termsRef = useRef(terms);
  termsRef.current = terms;

  // --- Entity CRUD ---
  const addEntity = useCallback((params = {}) => {
    const entity = makeEntity(params);
    setEntities((prev) => [...prev, entity]);
    return entity;
  }, []);

  const updateEntity = useCallback((entityId, updates) => {
    let updated = null;
    setEntities((prev) =>
      prev.map((e) => {
        if (e.id === entityId) {
          updated = { ...e, ...updates, id: e.id, attributes: updates.attributes || e.attributes };
          return updated;
        }
        return e;
      })
    );
    return updated;
  }, []);

  const deleteEntity = useCallback((entityId) => {
    setEntities((prev) => prev.filter((e) => e.id !== entityId));
    setReferences((prev) =>
      prev.filter((r) => r.sourceEntityId !== entityId && r.targetEntityId !== entityId)
    );
    setSelectedId((prev) => (prev === entityId ? null : prev));
  }, []);

  // --- Attribute CRUD ---
  const addAttribute = useCallback((entityId, params = {}) => {
    const attr = makeAttribute(params);
    let result = null;
    setEntities((prev) =>
      prev.map((e) => {
        if (e.id === entityId) {
          result = attr;
          return { ...e, attributes: [...e.attributes, attr] };
        }
        return e;
      })
    );
    return result || attr;
  }, []);

  const updateAttribute = useCallback((entityId, attributeId, updates) => {
    let result = null;
    setEntities((prev) =>
      prev.map((e) => {
        if (e.id === entityId) {
          return {
            ...e,
            attributes: e.attributes.map((a) => {
              if (a.id === attributeId) {
                result = { ...a, ...updates, id: a.id };
                return result;
              }
              return a;
            }),
          };
        }
        return e;
      })
    );
    return result;
  }, []);

  const deleteAttribute = useCallback((entityId, attributeId) => {
    setEntities((prev) =>
      prev.map((e) => {
        if (e.id === entityId) {
          return { ...e, attributes: e.attributes.filter((a) => a.id !== attributeId) };
        }
        return e;
      })
    );
  }, []);

  const setIdentifier = useCallback((entityId, attributeIds) => {
    setEntities((prev) =>
      prev.map((e) => {
        if (e.id === entityId) {
          return {
            ...e,
            attributes: e.attributes.map((a) => {
              const idx = attributeIds.indexOf(a.id);
              return {
                ...a,
                isIdentifier: idx >= 0,
                identifierOrder: idx >= 0 ? idx + 1 : null,
              };
            }),
          };
        }
        return e;
      })
    );
  }, []);

  // --- Reference CRUD ---
  const addReference = useCallback((params = {}) => {
    const ref = makeReference(params);
    setReferences((prev) => [...prev, ref]);

    // Auto-generate reference identifier attributes on source entity
    const sourceId = ref.sourceEntityId;
    const targetId = ref.targetEntityId;
    if (sourceId && targetId) {
      setEntities((prev) => {
        const target = prev.find((e) => e.id === targetId);
        if (!target) return prev;
        const ownIds = target.attributes.filter(
          (a) => a.isIdentifier && (a.identifierType === "own" || !a.identifierType)
        );
        if (ownIds.length === 0) return prev;

        return prev.map((e) => {
          if (e.id !== sourceId) return e;
          const source = e;
          const existingIdCount = source.attributes.filter((a) => a.isIdentifier).length;
          const isRecursive = source.subtype === "recursive" && sourceId === targetId;
          const copies = isRecursive ? 2 : 1;
          const newAttrs = [];
          for (let c = 0; c < copies; c++) {
            ownIds.forEach((ownAttr, i) => {
              newAttrs.push(
                makeAttribute({
                  name: ownAttr.name,
                  dataType: ownAttr.dataType,
                  isIdentifier: true,
                  identifierType: "reference",
                  referenceId: ref.id,
                  identifierOrder: existingIdCount + newAttrs.length + 1,
                  isRequired: true,
                })
              );
            });
          }
          return { ...source, attributes: [...source.attributes, ...newAttrs] };
        });
      });
    }

    return ref;
  }, []);

  const updateReference = useCallback((referenceId, updates) => {
    let result = null;
    setReferences((prev) =>
      prev.map((r) => {
        if (r.id === referenceId) {
          result = { ...r, ...updates, id: r.id };
          return result;
        }
        return r;
      })
    );
    return result;
  }, []);

  const deleteReference = useCallback((referenceId) => {
    setReferences((prev) => prev.filter((r) => r.id !== referenceId));
    // Auto-delete reference identifier attributes linked to this reference
    setEntities((prev) =>
      prev.map((e) => {
        const filtered = e.attributes.filter((a) => a.referenceId !== referenceId);
        if (filtered.length === e.attributes.length) return e;
        return { ...e, attributes: filtered };
      })
    );
  }, []);

  // --- Note CRUD ---
  const addNote = useCallback((params = {}) => {
    const note = makeNote(params);
    setNotes((prev) => [...prev, note]);
    return note;
  }, []);

  const updateNote = useCallback((noteId, updates) => {
    let result = null;
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          result = { ...n, ...updates, id: n.id };
          return result;
        }
        return n;
      })
    );
    return result;
  }, []);

  const deleteNote = useCallback((noteId) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    setSelectedId((prev) => (prev === noteId ? null : prev));
  }, []);

  // --- Term CRUD ---
  const addTerm = useCallback((params = {}) => {
    const term = makeTerm(params);
    let error = null;
    setTerms((prev) => {
      if (prev.some((t) => t.name === term.name)) {
        error = `Term "${term.name}" already exists`;
        return prev;
      }
      return [...prev, term];
    });
    if (error) throw new Error(error);
    return term;
  }, []);

  const updateTerm = useCallback((termId, updates) => {
    let result = null;
    let error = null;
    setTerms((prev) => {
      if (updates.name) {
        const duplicate = prev.find((t) => t.name === updates.name && t.id !== termId);
        if (duplicate) {
          error = `Term "${updates.name}" already exists`;
          return prev;
        }
      }
      return prev.map((t) => {
        if (t.id === termId) {
          result = { ...t, ...updates, id: t.id };
          return result;
        }
        return t;
      });
    });
    if (error) throw new Error(error);
    return result;
  }, []);

  const deleteTerm = useCallback((termId) => {
    setTerms((prev) => prev.filter((t) => t.id !== termId));
  }, []);

  // --- Diagram operations ---
  const getDiagram = useCallback(() => {
    return {
      entities: entitiesRef.current,
      references: referencesRef.current,
      notes: notesRef.current,
      terms: termsRef.current,
    };
  }, []);

  const migrateAttributes = useCallback((entities) => {
    return (entities || []).map((e) => ({
      ...e,
      attributes: (e.attributes || []).map((a) => ({
        ...a,
        identifierType:
          a.identifierType !== undefined
            ? a.identifierType
            : a.isIdentifier
              ? "own"
              : null,
        referenceId: a.referenceId !== undefined ? a.referenceId : null,
      })),
    }));
  }, []);

  const importDiagram = useCallback((diagram, clearCurrent = true) => {
    const migratedEntities = migrateAttributes(diagram.entities);
    if (clearCurrent) {
      setEntities(migratedEntities);
      setReferences(diagram.references || []);
      setNotes(diagram.notes || []);
      setSelectedId(null);
    } else {
      setEntities((prev) => [...prev, ...migratedEntities]);
      setReferences((prev) => [...prev, ...(diagram.references || [])]);
      setNotes((prev) => [...prev, ...(diagram.notes || [])]);
    }
  }, [migrateAttributes]);

  const autoLayout = useCallback((strategy) => {
    setEntities((prev) => {
      const sorted = [...prev].sort((a, b) => {
        const order = { basic: 0, correspondence: 1, recursive: 2 };
        return (order[a.subtype] ?? 0) - (order[b.subtype] ?? 0);
      });

      const resources = sorted.filter((e) => e.type === "resource");
      const events = sorted.filter((e) => e.type === "event");

      const layoutRow = (list, startY) =>
        list.map((e, i) => ({ ...e, x: 50 + i * 280, y: startY }));

      return [...layoutRow(resources, 50), ...layoutRow(events, 400)];
    });
  }, []);

  const validateModel = useCallback(() => {
    const errors = [];
    const warnings = [];
    const ents = entitiesRef.current;
    const refs = referencesRef.current;

    // Check entities have names
    ents.forEach((e) => {
      if (!e.name || e.name === "Untitled") {
        warnings.push(`Entity "${e.id}" has no meaningful name.`);
      }
      // Check identifiers
      const identifiers = e.attributes.filter((a) => a.isIdentifier);
      if (identifiers.length === 0) {
        warnings.push(`Entity "${e.name}" has no identifier attributes.`);
      }
    });

    // Check references point to existing entities
    refs.forEach((r) => {
      if (!ents.find((e) => e.id === r.sourceEntityId)) {
        errors.push(`Reference "${r.id}" has invalid source entity.`);
      }
      if (!ents.find((e) => e.id === r.targetEntityId)) {
        errors.push(`Reference "${r.id}" has invalid target entity.`);
      }
    });

    // TM rule: Event entities should reference at least one Resource
    const events = ents.filter((e) => e.type === "event");
    events.forEach((ev) => {
      const hasResourceRef = refs.some(
        (r) =>
          (r.sourceEntityId === ev.id &&
            ents.find((e) => e.id === r.targetEntityId)?.type === "resource") ||
          (r.targetEntityId === ev.id &&
            ents.find((e) => e.id === r.sourceEntityId)?.type === "resource")
      );
      if (!hasResourceRef) {
        warnings.push(`Event "${ev.name}" does not reference any Resource entity.`);
      }
    });

    // TM rule: Correspondence entities should connect two or more entities
    const correspondences = ents.filter((e) => e.subtype === "correspondence");
    correspondences.forEach((ce) => {
      const relatedRefs = refs.filter(
        (r) => r.sourceEntityId === ce.id || r.targetEntityId === ce.id
      );
      if (relatedRefs.length < 2) {
        warnings.push(
          `Correspondence entity "${ce.name}" should reference at least 2 other entities.`
        );
      }
    });

    return { valid: errors.length === 0, errors, warnings };
  }, []);

  const value = {
    entities,
    references,
    notes,
    terms,
    selectedId,
    setSelectedId,
    addEntity,
    updateEntity,
    deleteEntity,
    addAttribute,
    updateAttribute,
    deleteAttribute,
    setIdentifier,
    addReference,
    updateReference,
    deleteReference,
    addNote,
    updateNote,
    deleteNote,
    addTerm,
    updateTerm,
    deleteTerm,
    getDiagram,
    importDiagram,
    autoLayout,
    validateModel,
  };

  return <DiagramContext.Provider value={value}>{children}</DiagramContext.Provider>;
}

export default DiagramContext;
