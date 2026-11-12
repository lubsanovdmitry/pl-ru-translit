import assert from "node:assert/strict";
import test from "node:test";
import { transliterateRussian } from "../lib/transliterate-russian.mjs";

const specificationExamples = [
  ["тётя", "tiotia"],
  ["дядя", "diadia"],
  ["нести", "niesti"],
  ["белый", "biełyj"],
  ["тяжёлый", "tiažołyj"],
  ["пианино", "pïanino"],
  ["радио", "radïo"],
  ["диалог", "dïałog"],
  ["биатлон", "bïatłon"],
  ["мать", "mat́"],
  ["конь", "koń"],
  ["дверь", "dwieŕ"],
  ["семь", "sieḿ"],
  ["степь", "stieṕ"],
  ["любовь", "luboẃ"],
  ["ла", "ła"],
  ["ля", "la"],
  ["лэ", "łe"],
  ["ле", "le"],
  ["лы", "ły"],
  ["ли", "li"],
  ["ло", "ło"],
  ["лё", "lo"],
  ["лу", "łu"],
  ["лю", "lu"],
  ["л", "ł"],
  ["ль", "l"],
  ["лапа", "łapa"],
  ["молоко", "mołoko"],
  ["только", "tolko"],
  ["столько", "stolko"],
  ["мильонов", "miljonow"],
  ["батальон", "bataljon"],
  ["компаньон", "kompańjon"],
  ["люди", "ludi"],
  ["поле", "pole"],
  ["сильный", "silnyj"],
  ["польский", "polskij"],
  ["жена", "žena"],
  ["жизнь", "žizń"],
  ["шёл", "šoł"],
  ["часы", "časy"],
  ["чёрный", "čornyj"],
  ["щука", "ščuka"],
  ["щётка", "ščotka"],
  ["ещё", "ješčo"],
  ["широкий", "širokij"],
  ["май", "maj"],
  ["край", "kraj"],
  ["мой", "moj"],
  ["русский", "russkij"],
  ["яма", "jama"],
  ["ель", "jel"],
  ["ёлка", "jołka"],
  ["юг", "jug"],
  ["моя", "moja"],
  ["поёт", "pojot"],
  ["знает", "znajet"],
  ["её", "jejo"],
  ["подъезд", "podjezd"],
  ["объём", "objom"],
  ["разъезд", "razjezd"],
  ["съесть", "sjest́"],
  ["сесть", "siest́"],
  ["семья", "sieḿja"],
  ["вьюга", "ẃjuga"],
  ["пьеса", "ṕjesa"],
  ["статья", "stat́ja"],
  ["льёт", "ljot"],
  ["бельё", "bieljo"],
  ["мышью", "myšju"],
  ["ночью", "nočju"],
  ["мышь", "myš"],
  ["рожь", "rož"],
  ["ночь", "noč"],
  ["вещь", "wiešč"],
  ["туш", "tuš"],
  ["тушь", "tuš"],
  ["что", "čto"],
  ["счёт", "sčot"],
  ["счастье", "sčast́je"],
  ["получится", "połučitsia"],
  ["Россия", "Rossija"],
  ["Москва", "Moskwa"],
  ["человек", "čełowiek"],
  ["пришёл", "prišoł"],
  ["теперь", "tiepieŕ"],
  ["нельзя", "nielzia"],
  ["ничего", "ničego"],
  ["изменить", "izmienit́"],
  ["сегодня", "siegodnia"],
  ["день", "dień"],
  ["знал", "znał"],
  ["был", "był"],
  ["всё", "wsio"],
];

for (const [cyrillic, latin] of specificationExamples) {
  test(`${cyrillic} → ${latin}`, () => {
    assert.equal(transliterateRussian(cyrillic), latin);
  });
}

test("implements the base consonant alphabet and paired-vowel row", () => {
  const examples = [
    ["б", "b"],
    ["п", "p"],
    ["в", "w"],
    ["ф", "f"],
    ["г", "g"],
    ["к", "k"],
    ["д", "d"],
    ["т", "t"],
    ["з", "z"],
    ["с", "s"],
    ["м", "m"],
    ["н", "n"],
    ["р", "r"],
    ["й", "j"],
    ["х", "ch"],
    ["ц", "c"],
    ["ч", "č"],
    ["ш", "š"],
    ["ж", "ž"],
    ["щ", "šč"],
    ["та", "ta"],
    ["тя", "tia"],
    ["тэ", "te"],
    ["те", "tie"],
    ["ты", "ty"],
    ["ти", "ti"],
    ["то", "to"],
    ["тё", "tio"],
    ["ту", "tu"],
    ["тю", "tiu"],
  ];

  for (const [cyrillic, latin] of examples) {
    assert.equal(transliterateRussian(cyrillic), latin);
  }
});

test("uses ï only when a separate и would otherwise look like a softness marker", () => {
  assert.equal(transliterateRussian("Сиам сия"), "Sïam sija");
});

test("renders the complete residual-softness consonant row", () => {
  const examples = [
    ["бь", "b́"],
    ["вь", "ẃ"],
    ["гь", "ǵ"],
    ["дь", "d́"],
    ["зь", "ź"],
    ["кь", "ḱ"],
    ["мь", "ḿ"],
    ["нь", "ń"],
    ["пь", "ṕ"],
    ["рь", "ŕ"],
    ["сь", "ś"],
    ["ть", "t́"],
    ["фь", "f́"],
    ["хь", "ch́"],
  ];

  for (const [cyrillic, latin] of examples) {
    assert.equal(transliterateRussian(cyrillic), latin);
  }
});

test("matches both connected examples from the specification", () => {
  assert.equal(
    transliterateRussian(
      "Ещё один человек пришёл и сказал, что теперь нельзя ничего изменить. Подъём был тяжёлый, но люди всё ещё верили, что всё получится.",
    ),
    "Ješčo odin čełowiek prišoł i skazał, čto tiepieŕ nielzia ničego izmienit́. Podjom był tiažołyj, no ludi wsio ješčo wierili, čto wsio połučitsia.",
  );

  assert.equal(
    transliterateRussian(
      "Съесть пирог и сесть у двери было проще, чем объяснить семье, почему вьюга сорвала подъезд.",
    ),
    "Sjest́ pirog i siest́ u dwieri było prošče, čem objasnit́ sieḿje, počemu ẃjuga sorwała podjezd.",
  );
});

test("preserves normal title case, all caps, punctuation, and other scripts", () => {
  assert.equal(
    transliterateRussian("РОССИЯ, Москва! Polska — Ελληνικά 2026."),
    "ROSSIJA, Moskwa! Polska — Ελληνικά 2026.",
  );
  assert.equal(transliterateRussian("ЩУКА ХЛЕБ"), "ŠČUKA CHLEB");
});

test("returns normative NFC text while retaining combining acute where required", () => {
  const result = transliterateRussian("мать дверь любовь");
  assert.equal(result, "mat́ dwieŕ luboẃ");
  assert.equal(result, result.normalize("NFC"));
});
