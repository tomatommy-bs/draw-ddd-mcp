import React, { useState, useMemo } from "react";
import { useDiagram } from "../context/DiagramContext";
import { parseRefs } from "../utils/glossaryRefs";
import DefinitionText from "./DefinitionText";

const inputStyle = {
  width: '100%',
  backgroundColor: 'var(--bg-overlay)',
  border: '1px solid var(--border-default)',
  borderRadius: '6px',
  padding: '6px 10px',
  fontSize: '13px',
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: "'Inter', -apple-system, sans-serif",
};

function TermForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [name, setName] = useState(initial?.name || "");
  const [definition, setDefinition] = useState(initial?.definition || "");
  const [context, setContext] = useState(initial?.context || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !definition.trim()) return;
    onSubmit({ name: name.trim(), definition: definition.trim(), context: context.trim() });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 p-3 rounded-lg"
      style={{ backgroundColor: 'var(--bg-overlay)', border: '1px solid var(--border-default)' }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="用語名"
        style={inputStyle}
        autoFocus
      />
      <textarea
        value={definition}
        onChange={(e) => setDefinition(e.target.value)}
        placeholder="定義 (例: [[R:顧客]] が [[E:受注]] を...)"
        rows={3}
        style={{ ...inputStyle, resize: 'none' }}
      />
      <input
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="文脈 (例: 営業チームの業務フロー)"
        style={inputStyle}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
          style={{
            backgroundColor: 'var(--accent-brand)',
            color: '#fff',
          }}
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
          style={{
            backgroundColor: 'var(--bg-muted)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
          }}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}

function TermCard({ term, entities, selectedId, onEntityClick }) {
  const { updateTerm, deleteTerm } = useDiagram();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const linkedEntity = term.entityRef
    ? entities.find((e) => e.id === term.entityRef)
    : null;

  const isDirectMatch = selectedId && term.entityRef
    ? entities.find((e) => e.id === term.entityRef)?.id === selectedId
    : false;

  const handleUpdate = (data) => {
    try {
      updateTerm(term.id, data);
      setEditing(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = () => {
    deleteTerm(term.id);
    setConfirmDelete(false);
  };

  if (editing) {
    return (
      <TermForm
        initial={term}
        onSubmit={handleUpdate}
        onCancel={() => setEditing(false)}
        submitLabel="更新"
      />
    );
  }

  return (
    <div
      className="p-3 rounded-lg transition-colors"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: `1px solid ${isDirectMatch ? 'rgba(245,158,11,0.3)' : 'var(--border-default)'}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {isDirectMatch && (
            <span style={{ color: '#f59e0b', fontSize: '10px' }} title="直接対応">&#9670;</span>
          )}
          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
            {term.name}
          </span>
          {linkedEntity && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: linkedEntity.type === "resource"
                  ? 'var(--accent-resource-muted)'
                  : 'var(--accent-event-muted)',
                color: linkedEntity.type === "resource"
                  ? 'var(--accent-resource)'
                  : 'var(--accent-event)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
              }}
            >
              {linkedEntity.type === "resource" ? "R" : "E"}:{linkedEntity.name}
            </span>
          )}
          {term.entityRef && !linkedEntity && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '10px' }}
            >
              unlinked
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <IconButton onClick={() => setEditing(true)} title="編集">
            <EditIcon />
          </IconButton>
          {confirmDelete ? (
            <button
              onClick={handleDelete}
              className="text-xs px-1.5 py-0.5 rounded transition-colors"
              style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)' }}
            >
              確認
            </button>
          ) : (
            <IconButton onClick={() => setConfirmDelete(true)} title="削除" hoverColor="#ef4444">
              <CloseIcon />
            </IconButton>
          )}
        </div>
      </div>
      <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        <DefinitionText text={term.definition} onEntityClick={onEntityClick} />
      </div>
      {term.context && (
        <div className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
          {term.context}
        </div>
      )}
      {term.rejected?.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          {term.rejected.map((r, i) => (
            <div key={i} className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="line-through">{r.term}</span> — {r.reason}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GlossaryPanel() {
  const { terms, entities, selectedId, setSelectedId, addTerm } = useDiagram();
  const onEntityClick = (entityId) => setSelectedId(entityId);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredTerms = useMemo(() => {
    let result = terms;

    if (selectedId) {
      const selectedEntity = entities.find((e) => e.id === selectedId);
      if (selectedEntity) {
        result = result.filter((t) => {
          if (t.entityRef === selectedId) return true;
          const refs = parseRefs(t.definition);
          return refs.some(
            (r) => r.name === selectedEntity.name && r.type === selectedEntity.type,
          );
        });
      }
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q),
      );
    }

    return result;
  }, [terms, entities, selectedId, search]);

  const handleAdd = (data) => {
    try {
      addTerm(data);
      setShowAddForm(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      className="w-80 flex flex-col h-full overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-overlay)',
        borderLeft: '1px solid var(--border-default)',
      }}
    >
      <div className="p-3" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Glossary
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--bg-muted)',
              color: 'var(--text-muted)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {filteredTerms.length}/{terms.length}
          </span>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="検索..."
          style={inputStyle}
        />
        {selectedId && entities.find((e) => e.id === selectedId) && (
          <div className="mt-1.5 text-xs" style={{ color: 'var(--accent-event)' }}>
            {entities.find((e) => e.id === selectedId)?.name} の関連用語
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredTerms.map((term) => (
          <TermCard
            key={term.id}
            term={term}
            entities={entities}
            selectedId={selectedId}
            onEntityClick={onEntityClick}
          />
        ))}
        {filteredTerms.length === 0 && (
          <div className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
            {terms.length === 0 ? "用語がまだ登録されていません" : "一致する用語がありません"}
          </div>
        )}
      </div>

      <div className="p-3" style={{ borderTop: '1px solid var(--border-default)' }}>
        {showAddForm ? (
          <TermForm
            onSubmit={handleAdd}
            onCancel={() => setShowAddForm(false)}
            submitLabel="追加"
          />
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full px-3 py-2 text-sm font-medium rounded-md transition-colors"
            style={{
              backgroundColor: 'var(--bg-muted)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
            }}
          >
            + 用語を追加
          </button>
        )}
      </div>
    </div>
  );
}

function IconButton({ onClick, title, children, hoverColor = 'var(--text-primary)' }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="text-xs px-1 transition-colors"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = hoverColor; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      {children}
    </button>
  );
}

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
