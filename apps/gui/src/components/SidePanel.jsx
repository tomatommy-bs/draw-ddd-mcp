import React, { useState } from "react";
import { useDiagram } from "../context/DiagramContext";

const PRESET_COLORS = [
  "#3b82f6", "#2563eb", "#1d4ed8",
  "#ef4444", "#dc2626", "#b91c1c",
  "#22c55e", "#16a34a", "#15803d",
  "#f59e0b", "#d97706", "#b45309",
  "#8b5cf6", "#7c3aed", "#6d28d9",
  "#6b7280", "#4b5563", "#374151",
];

const DATA_TYPES = [
  "string", "integer", "float", "boolean", "date", "datetime", "timestamp",
  "text", "uuid", "json", "decimal", "bigint",
];

export default function SidePanel() {
  const {
    entities,
    notes,
    selectedId,
    setSelectedId,
    updateEntity,
    deleteEntity,
    addAttribute,
    updateAttribute,
    deleteAttribute,
    updateNote,
    deleteNote,
  } = useDiagram();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const selectedEntity = entities.find((e) => e.id === selectedId);
  const selectedNote = notes.find((n) => n.id === selectedId);

  if (!selectedEntity && !selectedNote) return null;

  const handleClose = () => {
    setSelectedId(null);
    setConfirmDelete(false);
  };

  // --- Note panel ---
  if (selectedNote) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <span className="font-semibold text-sm text-gray-700">Note</span>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
            &times;
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Content</label>
            <textarea
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={5}
              value={selectedNote.content}
              onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateNote(selectedNote.id, { color: c })}
                  className="w-6 h-6 rounded border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: selectedNote.color === c ? "#111827" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              deleteNote(selectedNote.id);
              setConfirmDelete(false);
            }}
            className="mt-4 w-full py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
          >
            Delete Note
          </button>
        </div>
      </div>
    );
  }

  // --- Entity panel ---
  const entity = selectedEntity;

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <span className="font-semibold text-sm text-gray-700">
          {entity.type === "resource" ? "Resource" : "Event"} Entity
        </span>
        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
          &times;
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4 flex-1">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={entity.name}
            onChange={(e) => updateEntity(entity.id, { name: e.target.value })}
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
          <select
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={entity.type}
            onChange={(e) => {
              const newType = e.target.value;
              updateEntity(entity.id, {
                type: newType,
                color: newType === "resource" ? "#3b82f6" : "#ef4444",
              });
            }}
          >
            <option value="resource">Resource</option>
            <option value="event">Event</option>
          </select>
        </div>

        {/* Subtype */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Subtype</label>
          <select
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={entity.subtype}
            onChange={(e) => updateEntity(entity.id, { subtype: e.target.value })}
          >
            <option value="basic">Basic</option>
            <option value="recursive">Recursive</option>
            <option value="correspondence">Correspondence</option>
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => updateEntity(entity.id, { color: c })}
                className="w-6 h-6 rounded border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: entity.color === c ? "#111827" : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Comment</label>
          <textarea
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm resize-y min-h-[48px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={2}
            value={entity.comment}
            onChange={(e) => updateEntity(entity.id, { comment: e.target.value })}
          />
        </div>

        {/* Attributes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-500">Attributes</label>
            <button
              onClick={() => addAttribute(entity.id)}
              className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              + Add Attribute
            </button>
          </div>

          {entity.attributes.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No attributes yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {entity.attributes.map((attr) => (
                <AttributeRow
                  key={attr.id}
                  attr={attr}
                  entityId={entity.id}
                  updateAttribute={updateAttribute}
                  deleteAttribute={deleteAttribute}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete button */}
      <div className="p-4 border-t border-gray-200">
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-2 text-sm font-medium text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
          >
            Delete Entity
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                deleteEntity(entity.id);
                setConfirmDelete(false);
              }}
              className="flex-1 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AttributeRow({ attr, entityId, updateAttribute, deleteAttribute }) {
  return (
    <div className="border border-gray-200 rounded p-2 bg-gray-50">
      <div className="flex items-center gap-1.5 mb-1.5">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={attr.name}
          placeholder="name"
          onChange={(e) =>
            updateAttribute(entityId, attr.id, { name: e.target.value })
          }
        />
        <select
          className="border border-gray-300 rounded px-1 py-0.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={attr.dataType}
          onChange={(e) =>
            updateAttribute(entityId, attr.id, { dataType: e.target.value })
          }
        >
          {DATA_TYPES.map((dt) => (
            <option key={dt} value={dt}>
              {dt}
            </option>
          ))}
        </select>
        <button
          onClick={() => deleteAttribute(entityId, attr.id)}
          className="text-red-400 hover:text-red-600 text-xs leading-none px-1"
          title="Delete attribute"
        >
          &times;
        </button>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            className="rounded"
            checked={attr.isIdentifier}
            onChange={(e) =>
              updateAttribute(entityId, attr.id, { isIdentifier: e.target.checked })
            }
          />
          Identifier
        </label>
        <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            className="rounded"
            checked={attr.isRequired}
            onChange={(e) =>
              updateAttribute(entityId, attr.id, { isRequired: e.target.checked })
            }
          />
          Required
        </label>
      </div>
    </div>
  );
}
