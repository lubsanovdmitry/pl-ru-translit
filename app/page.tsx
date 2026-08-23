"use client";

import { useMemo, useState } from "react";
import { transliteratePolish } from "@/lib/transliterate.mjs";

const EXAMPLES = [
  {
    label: "Коротко",
    text: "Śmiało! To pieśń przyszłości.",
  },
  {
    label: "Юсы",
    text: "Ręka, mąż, pięć, książka, miesiąc, są.",
  },
  {
    label: "Характерные слова",
    text: "Człowiek, ludzie, język, święty, Polska.",
  },
  {
    label: "Строка песни",
    text: "Naprzód, Warszawo! Na walkę krwawą, świętą a prawą.",
  },
] as const;

const INITIAL_TEXT = EXAMPLES[0].text;

export default function Home() {
  const [input, setInput] = useState(INITIAL_TEXT);
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
    <main className="site-shell">
      <header className="masthead">
        <a className="brand" href="#top" aria-label="Польская кириллица — наверх">
          <span className="brand-mark" aria-hidden="true">Ѧ</span>
          <span>Польская кириллица</span>
        </a>
        <div className="version-pill"><span /> система v1.0</div>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow"><span>PL</span> Narzędzie do zapisu</p>
        <h1>Польский,<br /><em>по-кириллически.</em></h1>
        <p className="hero-copy">
          Не подмена букв, а самостоятельная орфография — с мягкими рядами,
          юсами и историческим <b>рж</b>.
        </p>
      </section>

      <section className="translit-card" aria-label="Транслитератор">
        <div className="card-topline">
          <div className="direction-labels" aria-label="Направление перевода">
            <span className="language-active">PL</span>
            <span className="direction-arrow" aria-hidden="true">→</span>
            <span>КИР</span>
          </div>
          <p className="live-indicator"><span /> Контекст учитывается</p>
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
            />
            <span className="char-count" id="input-statistics">
              {wordCount} {wordCount === 1 ? "слово" : "слов"} · {characterCount} знаков
            </span>
          </div>

          <div className="editor-divider" aria-hidden="true"><span>→</span></div>

          <div className="editor-pane output-pane">
            <p className="pane-label">Кириллица</p>
            <div
              className={`output-text ${output ? "" : "is-empty"}`}
              id="cyrillic-output"
              aria-live="polite"
            >
              {output || "Здесь появится транслитерация"}
            </div>
            <span className="alphabet-hint" aria-hidden="true">Ѧ · Ѩ · Ѫ · Ѭ</span>
          </div>
        </div>

        <div className="card-actions">
          <button className="text-button" type="button" onClick={() => updateInput("")} disabled={!input}>
            <span aria-hidden="true">×</span> Очистить
          </button>
          <div className="copy-group">
            {copyState === "error" && <span className="copy-error">Не удалось скопировать</span>}
            <button
              className={`copy-button ${copyState === "copied" ? "is-copied" : ""}`}
              type="button"
              onClick={copyOutput}
              disabled={!output}
              aria-controls="cyrillic-output"
            >
              {copyState === "copied" ? "Скопировано" : "Скопировать"}
              <span aria-hidden="true">{copyState === "copied" ? "✓" : "⌘C"}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="examples" aria-labelledby="examples-title">
        <p className="section-kicker" id="examples-title">Попробуйте на примере</p>
        <div className="example-list">
          {EXAMPLES.map((example, index) => (
            <button
              type="button"
              key={example.label}
              onClick={() => updateInput(example.text)}
              aria-pressed={input === example.text}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {example.label}
            </button>
          ))}
        </div>
      </section>

      <section className="principles" aria-label="Основные принципы">
        <p className="section-kicker">В основе</p>
        <div className="principle-grid">
          <article><span>01</span><h2>Мягкость</h2><p>Гласная говорит за согласную. Мягкий знак — только по необходимости.</p></article>
          <article><span>02</span><h2>Юсы</h2><p>Польские <i>ę</i> и <i>ą</i> получают собственные знаки: ѧ и ѫ.</p></article>
          <article><span>03</span><h2>История</h2><p><i>rz</i> остаётся диграфом <b>рж</b>, сохраняя устройство польского слова.</p></article>
        </div>
        <div className="rule-ribbon" aria-label="Примеры правил">
          <div><code>się</code><span>→</span><strong>шѩ</strong></div>
          <div><code>książka</code><span>→</span><strong>кшѭжка</strong></div>
          <div><code>rzeka</code><span>→</span><strong>ржэка</strong></div>
          <div><code>Polska</code><span>→</span><strong>Польска</strong></div>
        </div>
      </section>

      <footer className="footer">
        <p><span className="brand-mark footer-mark" aria-hidden="true">Ѧ</span> Польская кириллица</p>
        <p>Фонематическая орфография · спецификация v1.0</p>
      </footer>
    </main>
  );
}
