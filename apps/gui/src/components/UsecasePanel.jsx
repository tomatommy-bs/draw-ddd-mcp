import React from "react";
import { useDiagram } from "../context/DiagramContext";

export default function UsecasePanel() {
  const { usecases, entities, highlight, activateUsecase, clearUsecaseHighlight, deleteUsecase } =
    useDiagram();

  const activeId = highlight?._usecaseId || null;

  const resolveEntityName = (entityId) => {
    const e = entities.find((ent) => ent.id === entityId);
    return e ? e.name : entityId.slice(0, 8);
  };

  const handleClick = (uc) => {
    if (activeId === uc.id) {
      clearUsecaseHighlight();
    } else {
      activateUsecase(uc.id);
    }
  };

  return (
    <div
      className="w-72 flex flex-col h-full overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-overlay)',
        borderLeft: '1px solid var(--border-default)',
      }}
    >
      <div className="p-3" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Use Cases
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--bg-muted)',
              color: 'var(--text-muted)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {usecases.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {usecases.map((uc) => {
          const isActive = activeId === uc.id;
          return (
            <div
              key={uc.id}
              onClick={() => handleClick(uc)}
              className="p-3 rounded-lg transition-colors"
              style={{
                backgroundColor: isActive ? 'rgba(234,179,8,0.08)' : 'var(--bg-surface)',
                border: `1px solid ${isActive ? 'rgba(234,179,8,0.4)' : 'var(--border-default)'}`,
                boxShadow: isActive
                  ? '0 0 0 2px rgba(234,179,8,0.12)'
                  : '0 1px 2px rgba(0,0,0,0.04)',
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  {uc.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteUsecase(uc.id);
                  }}
                  className="text-xs px-1 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  title="削除"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              {uc.description && (
                <div className="text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {uc.description}
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {uc.targets.map((t) => {
                  const entity = entities.find((e) => e.id === t.entityId);
                  const isResource = entity?.type === 'resource';
                  const isPartial = Array.isArray(t.attributeIds);
                  return (
                    <span
                      key={t.entityId}
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: isResource
                          ? 'var(--accent-resource-muted)'
                          : 'var(--accent-event-muted)',
                        color: isResource
                          ? 'var(--accent-resource)'
                          : 'var(--accent-event)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '10px',
                        opacity: isPartial ? 0.7 : 1,
                      }}
                    >
                      {isPartial ? '◇' : '◆'} {resolveEntityName(t.entityId)}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
        {usecases.length === 0 && (
          <div className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
            ユースケースがまだ登録されていません
          </div>
        )}
      </div>
    </div>
  );
}
