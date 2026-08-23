import assert from "node:assert/strict";
import test from "node:test";
import { transliteratePolish } from "../lib/transliterate.mjs";

const specificationExamples = [
  ["tak", "так"],
  ["ten", "тэн"],
  ["pewny", "пэвны"],
  ["nie", "не"],
  ["góra", "гура"],
  ["ręka", "рѧка"],
  ["są", "сѫ"],
  ["miasto", "място"],
  ["wiara", "вяра"],
  ["siostra", "шёстра"],
  ["pięć", "пѩчь"],
  ["nią", "нѭ"],
  ["święty", "швѩты"],
  ["ś", "шь"],
  ["ź", "жь"],
  ["być", "бычь"],
  ["kość", "кошчь"],
  ["si", "ши"],
  ["sia", "шя"],
  ["sie", "ше"],
  ["się", "шѩ"],
  ["ci", "чи"],
  ["cia", "чя"],
  ["zie", "же"],
  ["dzie", "дже"],
  ["koń", "конь"],
  ["konie", "коне"],
  ["dania", "даня"],
  ["zbratania", "збратаня"],
  ["zmartwychwstania", "змартвыхвстаня"],
  ["śmiało", "шмяло"],
  ["świat", "швят"],
  ["śpiew", "шпев"],
  ["śnieg", "шнег"],
  ["pieśń", "пешнь"],
  ["ludzkości", "людзкошчи"],
  ["sprawiedliwości", "справедливошчи"],
  ["przyszłości", "пржышлошчи"],
  ["będę", "бѧдѧ"],
  ["mąż", "мѫж"],
  ["książka", "кшѭжка"],
  ["miesiąc", "мешѭц"],
  ["był", "был"],
  ["głód", "глуд"],
  ["głowa", "глова"],
  ["młody", "млоды"],
  ["lato", "лято"],
  ["lud", "люд"],
  ["lubić", "любичь"],
  ["Polska", "Польска"],
  ["żona", "жона"],
  ["rzeka", "ржэка"],
  ["morze", "моржэ"],
  ["może", "можэ"],
  ["przód", "пржуд"],
  ["przy", "пржы"],
  ["trzy", "тржы"],
  ["krzyk", "кржык"],
  ["przyszłość", "пржышлошчь"],
  ["chleb", "хлэб"],
  ["próg", "пруг"],
  ["człowiek", "чловек"],
  ["ludzie", "людже"],
  ["język", "ѩзык"],
];

for (const [polish, cyrillic] of specificationExamples) {
  test(`${polish} → ${cyrillic}`, () => {
    assert.equal(transliteratePolish(polish), cyrillic);
  });
}

test("preserves punctuation, whitespace, line breaks, and non-Latin text", () => {
  assert.equal(
    transliteratePolish("Polska — tak!\n123 / уже кириллица"),
    "Польска — так!\n123 / уже кириллица",
  );
});

test("preserves all-caps and title-case words", () => {
  assert.equal(transliteratePolish("POLSKA Rzeka"), "ПОЛЬСКА Ржэка");
});

test("keeps an explicit soft sign in unrelated hard clusters", () => {
  assert.equal(transliteratePolish("środa"), "шьрода");
});
