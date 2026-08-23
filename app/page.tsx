"use client";

import { useMemo, useState } from "react";
import { transliteratePolish } from "@/lib/transliterate.mjs";

export default function Home() {
  const [input, setInput] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const output = useMemo(() => transliteratePolish(input), [input]);
  const characterCount = Array.from(input).length;
  const wordCount = input.trim() ? input.trim().split(/\s+/u).length : 0;

  function updateInput(value: string) {
    setInput(value);
    setCopyState("idle");
  }

  async function copyOutput() {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">Ѧ</span>
          <h1>Польская кириллица</h1>
        </div>
        <span className="app-version">v1.0</span>
      </header>

      <section className="translit-card" aria-label="Транслитератор">
        <div className="card-topline" aria-label="Направление транслитерации">
          <span className="language-active">PL</span>
          <span className="direction-arrow" aria-hidden="true">→</span>
          <span>КИР</span>
        </div>

        <div className="editor-grid">
          <div className="editor-pane input-pane">
            <label htmlFor="polish-input">Польский текст</label>
            <textarea
              id="polish-input"
              value={input}
              onChange={(event) => updateInput(event.target.value)}
              spellCheck="true"
              placeholder="Wpisz lub wklej tekst po polsku…"
              aria-describedby="input-statistics"
              autoFocus
            />
            <span className="char-count" id="input-statistics">
              {wordCount} {wordCount === 1 ? "слово" : "слов"} · {characterCount} знаков
            </span>
          </div>

          <div className="editor-divider" aria-hidden="true" />

          <div className="editor-pane output-pane">
            <p className="pane-label">Кириллица</p>
            <div
              className={`output-text ${output ? "" : "is-empty"}`}
              id="cyrillic-output"
              aria-live="polite"
            >
              {output || "Результат появится здесь"}
            </div>
          </div>
        </div>

        <div className="card-actions">
          <button
            className="text-button"
            type="button"
            onClick={() => updateInput("")}
            disabled={!input}
          >
            Очистить
          </button>
          <div className="copy-group">
            {copyState === "error" && (
              <span className="copy-error">Не удалось скопировать</span>
            )}
            <button
              className={`copy-button ${copyState === "copied" ? "is-copied" : ""}`}
              type="button"
              onClick={copyOutput}
              disabled={!output}
              aria-controls="cyrillic-output"
            >
              {copyState === "copied" ? "Скопировано" : "Скопировать"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
