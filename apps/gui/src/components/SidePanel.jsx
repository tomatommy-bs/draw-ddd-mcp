import React, { useState } from "react";
import { useDiagram } from "../context/DiagramContext";

const PRESET_COLORS = [
  "#3b82f6", "#2563eb", "#1d4ed8",
  "#f59e0b", "#d97706", "#b45309",
  "#22c55e", "#16a34a", "#15803d",
  "#ef4444", "#dc2626", "#b91c1c",
  "#8b5cf6", "#7c3aed", "#6d28d9",
  "#6b7280", "#4b5563", "#374151",
];

const DATA_TYPES = [
  "string", "integer", "float", "boolean", "date", "datetime", "timestamp",
  "text", "uuid", "json", "decimal", "bigint",
];

const inputStyle = {
  width: '100%',
  backgroundColor: 'var(--bg-overlay)',
  border: '1px solid var(--border-default)',
  borderRadius: '6px',
  padding: '6px 10px',
  fontSize: '13px',
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: "'Inter', -apple-system, sans-serif",
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 500,
  color: 'var(--text-muted)',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

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

  if (selectedNote) {
    return (
      <div
        className="w-80 flex flex-col overflow-y-auto shrink-0"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-default)',
        }}
      >
        <PanelHeader title="Note" onClose={handleClose} />

        <div className="p-4 flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Content</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
              rows={5}
              value={selectedNote.content}
              onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent-brand)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Color</label>
            <ColorPicker
              colors={PRESET_COLORS}
              selected={selectedNote.color}
              onChange={(c) => updateNote(selectedNote.id, { color: c })}
            />
          </div>

          <DangerButton
            label="Delete Note"
            onClick={() => {
              deleteNote(selectedNote.id);
              setConfirmDelete(false);
            }}
          />
        </div>
      </div>
    );
  }

  const entity = selectedEntity;
  const isResource = entity.type === "resource";

  return (
    <div
      className="w-80 flex flex-col overflow-y-auto shrink-0"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-default)',
      }}
    >
      <PanelHeader
        title={isResource ? "Resource" : "Event"}
        badge={isResource ? "R" : "E"}
        badgeColor={isResource ? '#3b82f6' : '#f59e0b'}
        onClose={handleClose}
      />

      <div className="p-4 flex flex-col gap-4 flex-1">
        <div>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            style={inputStyle}
            value={entity.name}
            onChange={(e) => updateEntity(entity.id, { name: e.target.value })}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent-brand)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; }}
          />
        </div>

        <div>
          <label style={labelStyle}>Type</label>
          <select
            style={{ ...inputStyle, cursor: 'pointer' }}
            value={entity.type}
            onChange={(e) => {
              const newType = e.target.value;
              updateEntity(entity.id, {
                type: newType,
                color: newType === "resource" ? "#3b82f6" : "#f59e0b",
              });
            }}
          >
            <option value="resource">Resource</option>
            <option value="event">Event</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Subtype</label>
          <select
            style={{ ...inputStyle, cursor: 'pointer' }}
            value={entity.subtype}
            onChange={(e) => updateEntity(entity.id, { subtype: e.target.value })}
          >
            <option value="basic">Basic</option>
            <option value="recursive">Recursive</option>
            <option value="correspondence">Correspondence</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Color</label>
          <ColorPicker
            colors={PRESET_COLORS}
            selected={entity.color}
            onChange={(c) => updateEntity(entity.id, { color: c })}
          />
        </div>

        <div>
          <label style={labelStyle}>Comment</label>
          <textarea
            style={{ ...inputStyle, resize: 'vertical', minHeight: 48 }}
            rows={2}
            value={entity.comment}
            onChange={(e) => updateEntity(entity.id, { comment: e.target.value })}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent-brand)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label style={{ ...labelStyle, marginBottom: 0 }}>Attributes</label>
            <button
              onClick={() => addAttribute(entity.id)}
              className="text-xs px-2.5 py-1 rounded-md font-medium transition-colors"
              style={{
                backgroundColor: 'var(--accent-brand-muted)',
                color: 'var(--accent-brand)',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-brand-muted)'; }}
            >
              + Add
            </button>
          </div>

          {entity.attributes.length === 0 ? (
            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No attributes yet.</p>
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

      <DebugJson entity={entity} />

      <div className="p-4" style={{ borderTop: '1px solid var(--border-default)' }}>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-2 text-sm font-medium rounded-md transition-colors"
            style={{
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.2)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
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
              className="flex-1 py-2 text-sm font-medium rounded-md transition-colors"
              style={{ backgroundColor: '#ef4444', color: '#fff' }}
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-2 text-sm font-medium rounded-md transition-colors"
              style={{
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PanelHeader({ title, badge, badgeColor, onClose }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 shrink-0"
      style={{
        borderBottom: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          {title}
        </span>
        {badge && (
          <span
            className="text-xs font-semibold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${badgeColor}15`,
              color: badgeColor,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-lg leading-none transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        &times;
      </button>
    </div>
  );
}

function ColorPicker({ colors, selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className="w-6 h-6 rounded-md transition-all"
          style={{
            backgroundColor: c,
            border: selected === c ? '2px solid var(--text-primary)' : '2px solid transparent',
            opacity: selected === c ? 1 : 0.6,
            transform: selected === c ? 'scale(1.1)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  );
}

function DangerButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 w-full py-2 text-sm font-medium rounded-md transition-colors"
      style={{ backgroundColor: '#ef4444', color: '#fff' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; }}
    >
      {label}
    </button>
  );
}

function DebugJson({ entity }) {
  const [open, setOpen] = useState(false);
  const { references } = useDiagram();
  const relatedRefs = references.filter(
    (r) => r.sourceEntityId === entity.id || r.targetEntityId === entity.id
  );
  const debugData = { ...entity, _references: relatedRefs };
  return (
    <div className="px-4 pb-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs font-mono transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        {open ? "▼" : "▶"} Debug JSON
      </button>
      {open && (
        <pre
          className="mt-1 p-3 text-[10px] leading-tight rounded-md overflow-auto max-h-64"
          style={{
            backgroundColor: '#1e1e1e',
            color: '#10b981',
            border: '1px solid var(--border-default)',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {JSON.stringify(debugData, null, 2)}
        </pre>
      )}
    </div>
  );
}

function AttributeRow({ attr, entityId, updateAttribute, deleteAttribute }) {
  return (
    <div
      className="rounded-md p-2.5"
      style={{
        backgroundColor: 'var(--bg-overlay)',
        border: '1px solid var(--border-default)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <input
          type="text"
          style={{
            ...inputStyle,
            flex: 1,
            padding: '4px 8px',
            fontSize: '12px',
            fontFamily: "'JetBrains Mono', monospace",
          }}
          value={attr.name}
          placeholder="name"
          onChange={(e) =>
            updateAttribute(entityId, attr.id, { name: e.target.value })
          }
          onFocus={(e) => { e.target.style.borderColor = 'var(--accent-brand)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; }}
        />
        <select
          style={{
            ...inputStyle,
            width: 'auto',
            padding: '4px 6px',
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', monospace",
            cursor: 'pointer',
          }}
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
          className="text-xs leading-none px-1 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          title="Delete attribute"
        >
          &times;
        </button>
      </div>
      <div className="flex items-center gap-3">
        <CheckboxLabel
          label="Identifier"
          checked={attr.isIdentifier}
          onChange={(v) => updateAttribute(entityId, attr.id, { isIdentifier: v })}
        />
        <CheckboxLabel
          label="Required"
          checked={attr.isRequired}
          onChange={(v) => updateAttribute(entityId, attr.id, { isRequired: v })}
        />
      </div>
    </div>
  );
}

function CheckboxLabel({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>
      <input
        type="checkbox"
        className="rounded"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: 'var(--accent-brand)' }}
      />
      {label}
    </label>
  );
}
