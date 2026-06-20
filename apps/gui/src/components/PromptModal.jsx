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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <p className="text-xs text-indigo-200 font-medium uppercase tracking-wider mb-1">
            AI からの質問
          </p>
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>

        <div className="px-6 py-5">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{message}</p>

          <div className="mt-5">
            {type === "select" && options && (
              <div className="flex flex-col gap-2">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className="w-full px-4 py-2.5 text-sm font-medium text-left rounded-lg border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
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
                  className="px-5 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  いいえ
                </button>
                <button
                  onClick={() => handleConfirm(true)}
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="回答を入力..."
                  autoFocus
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!textValue.trim()}
                    className="px-5 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
