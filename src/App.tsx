import { useDeferredValue, useMemo, useState } from "react";
import { transliterateRussian } from "../lib/transliterate-russian.mjs";
import { transliteratePolish } from "../lib/transliterate.mjs";

const MODES = {
  "polish-cyrillic": {
    shortLabel: "PL → КИР",
    accessibleLabel: "Польский в кириллицу",
    mark: "Ѧ",
    inputLabel: "Польский текст",
    outputLabel: "Кириллица",
    inputLanguage: "pl",
    outputLanguage: "ru",
    inputPlaceholder: "Wpisz lub wklej tekst po polsku…",
    outputPlaceholder: "Результат появится здесь",
    transliterate: transliteratePolish,
  },
  "russian-latin": {
    shortLabel: "РУ → LAT",
    accessibleLabel: "Русский в западнославянскую латиницу",
    mark: "Ł",
    inputLabel: "Русский текст",
    outputLabel: "Латиница",
    inputLanguage: "ru",
    outputLanguage: "ru-Latn",
    inputPlaceholder: "Введите или вставьте русский текст…",
    outputPlaceholder: "Riezultat pojawitsia zdieś",
    transliterate: transliterateRussian,
  },
} as const;

type Mode = keyof typeof MODES;

export default function App() {
  const [mode, setMode] = useState<Mode>("polish-cyrillic");
  const [inputs, setInputs] = useState<Record<Mode, string>>({
    "polish-cyrillic": "",
    "russian-latin": "",
  });
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const activeMode = MODES[mode];
  const input = inputs[mode];
  const deferredInput = useDeferredValue(input);
  const output = useMemo(
    () => activeMode.transliterate(deferredInput),
    [activeMode, deferredInput],
  );
  const characterCount = Array.from(input).length;
  const wordCount = input.trim() ? input.trim().split(/\s+/u).length : 0;

  function updateInput(value: string) {
    setInputs((current) => ({ ...current, [mode]: value }));
    setCopyState("idle");
  }

  function selectMode(nextMode: Mode) {
    setMode(nextMode);
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
          <span className="brand-mark" aria-hidden="true">{activeMode.mark}</span>
          <h1>Транслитератор</h1>
        </div>
      </header>

      <section className="translit-card" aria-label="Транслитератор">
        <div className="card-topline">
          <div className="mode-switch" role="group" aria-label="Система транслитерации">
            {(Object.keys(MODES) as Mode[]).map((modeName) => {
              const option = MODES[modeName];
              const isActive = modeName === mode;

              return (
                <button
                  className={`mode-button ${isActive ? "is-active" : ""}`}
                  type="button"
                  key={modeName}
                  onClick={() => selectMode(modeName)}
                  aria-label={option.accessibleLabel}
                  aria-pressed={isActive}
                >
                  {option.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="editor-grid">
          <div className="editor-pane input-pane">
            <label htmlFor="transliteration-input">{activeMode.inputLabel}</label>
            <textarea
              className="input-field"
              id="transliteration-input"
              value={input}
              onChange={(event) => updateInput(event.target.value)}
              spellCheck="true"
              lang={activeMode.inputLanguage}
              placeholder={activeMode.inputPlaceholder}
              aria-describedby="input-statistics"
              rows={16}
            />
            <span className="char-count" id="input-statistics">
              {wordCount} {wordCount === 1 ? "слово" : "слов"} · {characterCount} знаков
            </span>
          </div>

          <div className="editor-divider" aria-hidden="true" />

          <div className="editor-pane output-pane">
            <label htmlFor="transliteration-output">{activeMode.outputLabel}</label>
            <textarea
              className="output-text"
              id="transliteration-output"
              value={output}
              placeholder={activeMode.outputPlaceholder}
              lang={activeMode.outputLanguage}
              readOnly
              aria-live="polite"
              rows={16}
            />
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
              aria-controls="transliteration-output"
            >
              {copyState === "copied" ? "Скопировано" : "Скопировать"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
