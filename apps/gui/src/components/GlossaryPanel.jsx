import React, { useState, useMemo } from "react";
import { useDiagram } from "../context/DiagramContext";
import { parseRefs } from "../utils/glossaryRefs";
import DefinitionText from "./DefinitionText";

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
    <form onSubmit={handleSubmit} className="space-y-2 p-3 bg-gray-700 rounded">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="用語名"
        className="w-full px-2 py-1 text-sm bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        autoFocus
      />
      <textarea
        value={definition}
        onChange={(e) => setDefinition(e.target.value)}
        placeholder="定義 (例: [[R:顧客]] が [[E:受注]] を...)"
        rows={3}
        className="w-full px-2 py-1 text-sm bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
      />
      <input
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="文脈 (例: 営業チームの業務フロー)"
        className="w-full px-2 py-1 text-sm bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-xs font-medium bg-gray-600 text-white rounded hover:bg-gray-500"
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
    <div className="p-3 bg-gray-800 rounded border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {isDirectMatch && (
            <span className="text-amber-400 text-xs" title="直接対応">✦</span>
          )}
          <span className="font-medium text-white text-sm">{term.name}</span>
          {linkedEntity && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                linkedEntity.type === "resource"
                  ? "bg-blue-900 text-blue-300"
                  : "bg-amber-900 text-amber-300"
              }`}
            >
              {linkedEntity.type === "resource" ? "R" : "E"}:{linkedEntity.name}
            </span>
          )}
          {term.entityRef && !linkedEntity && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-red-900 text-red-300">
              unlinked
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setEditing(true)}
            className="text-gray-400 hover:text-white text-xs px-1"
            title="編集"
          >
            ✎
          </button>
          {confirmDelete ? (
            <button
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 text-xs px-1"
            >
              確認
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-gray-400 hover:text-red-400 text-xs px-1"
              title="削除"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="text-gray-300 text-xs leading-relaxed">
        <DefinitionText text={term.definition} onEntityClick={onEntityClick} />
      </div>
      {term.context && (
        <div className="text-gray-500 text-xs mt-1">📋 {term.context}</div>
      )}
      {term.rejected?.length > 0 && (
        <div className="mt-1 space-y-0.5">
          {term.rejected.map((r, i) => (
            <div key={i} className="text-gray-500 text-xs">
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

    // Filter by selected entity
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

    // Filter by search
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
    <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-white">📖 Glossary</span>
          <span className="text-xs text-gray-500">{filteredTerms.length}/{terms.length}</span>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="検索..."
          className="w-full px-2 py-1 text-sm bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
        {selectedId && entities.find((e) => e.id === selectedId) && (
          <div className="mt-1 text-xs text-amber-400">
            ▸ {entities.find((e) => e.id === selectedId)?.name} の関連用語
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
          <div className="text-gray-500 text-xs text-center py-4">
            {terms.length === 0 ? "用語がまだ登録されていません" : "一致する用語がありません"}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-700">
        {showAddForm ? (
          <TermForm
            onSubmit={handleAdd}
            onCancel={() => setShowAddForm(false)}
            submitLabel="追加"
          />
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full px-3 py-1.5 text-sm font-medium bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
          >
            + 用語を追加
          </button>
        )}
      </div>
    </div>
  );
}
