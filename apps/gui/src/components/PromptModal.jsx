import React, { useState } from "react";

export default function PromptModal({ prompt, onRespond }) {
  const [textValue, setTextValue] = useState("");

  if (!prompt) return null;

  const { title, message, type, options } = prompt;

  const handleSelect = (option) => {
    onRespond({ selected: option });
  };

  const handleConfirm = (value) => {
    onRespond({ confirmed: value });
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textValue.trim()) {
      onRespond({ text: textValue.trim() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}>
      <div
        className="max-w-md w-full mx-4 overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.12)',
        }}
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-default)', background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, transparent 60%)' }}>
          <p
            className="text-xs font-medium uppercase tracking-wider mb-1"
            style={{ color: 'var(--accent-brand)', letterSpacing: '0.08em' }}
          >
            AI からの質問
          </p>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>

          <div className="mt-5">
            {type === "select" && options && (
              <div className="flex flex-col gap-2">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className="w-full px-4 py-2.5 text-sm font-medium text-left rounded-lg transition-all"
                    style={{
                      backgroundColor: 'var(--bg-overlay)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-brand)';
                      e.currentTarget.style.backgroundColor = 'var(--accent-brand-muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-overlay)';
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {type === "confirm" && (
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => handleConfirm(false)}
                  className="px-5 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  いいえ
                </button>
                <button
                  onClick={() => handleConfirm(true)}
                  className="px-5 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--accent-brand)', color: '#fff' }}
                >
                  はい
                </button>
              </div>
            )}

            {type === "text" && (
              <form onSubmit={handleTextSubmit} className="flex flex-col gap-3">
                <textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg resize-none"
                  style={{
                    backgroundColor: 'var(--bg-overlay)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontFamily: "'Inter', -apple-system, sans-serif",
                  }}
                  rows={3}
                  placeholder="回答を入力..."
                  autoFocus
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent-brand)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; }}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!textValue.trim()}
                    className="px-5 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--accent-brand)', color: '#fff' }}
                  >
                    送信
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
