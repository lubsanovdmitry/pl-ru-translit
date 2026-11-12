import { applyWordCase } from "./word-case.mjs";

const PAIRED_CONSONANTS = Object.freeze({
  б: Object.freeze({ hard: "b", soft: "b\u0301" }),
  в: Object.freeze({ hard: "w", soft: "ẃ" }),
  г: Object.freeze({ hard: "g", soft: "ǵ" }),
  д: Object.freeze({ hard: "d", soft: "d\u0301" }),
  з: Object.freeze({ hard: "z", soft: "ź" }),
  к: Object.freeze({ hard: "k", soft: "ḱ" }),
  м: Object.freeze({ hard: "m", soft: "ḿ" }),
  н: Object.freeze({ hard: "n", soft: "ń" }),
  п: Object.freeze({ hard: "p", soft: "ṕ" }),
  р: Object.freeze({ hard: "r", soft: "ŕ" }),
  с: Object.freeze({ hard: "s", soft: "ś" }),
  т: Object.freeze({ hard: "t", soft: "t\u0301" }),
  ф: Object.freeze({ hard: "f", soft: "f\u0301" }),
  х: Object.freeze({ hard: "ch", soft: "ch\u0301" }),
});

const UNPAIRED_CONSONANTS = Object.freeze({
  ж: "ž",
  ц: "c",
  ч: "č",
  ш: "š",
  щ: "šč",
});

const PLAIN_VOWELS = Object.freeze({
  а: "a",
  э: "e",
  и: "i",
  ы: "y",
  о: "o",
  у: "u",
});

const IOTATED_VOWELS = Object.freeze({
  я: "a",
  е: "e",
  ё: "o",
  ю: "u",
});

// After ь/ъ the vowel is separated with j: льёт, объём, and also мильон.
const SEPARATED_VOWELS = Object.freeze({ ...IOTATED_VOWELS, о: "o" });

const NEEDS_SEPARATE_I = new Set(["а", "э", "о", "у"]);
const RUSSIAN_WORD = /[А-ЯЁ]+/giu;

/**
 * Convert Russian Cyrillic into the West-Slavic-style Latin orthography from
 * russkaja_latinica_zapadnoslavjanskogo_tipa.md. All work happens locally;
 * punctuation, spacing, emoji, Latin text and non-Russian scripts pass through.
 *
 * @param {string} text
 * @returns {string}
 */
export function transliterateRussian(text) {
  if (!text) return "";

  return text
    .normalize("NFC")
    .replace(RUSSIAN_WORD, (word) =>
      applyWordCase(word, transliterateWord(word), "ru-RU", "pl-PL"),
    )
    .normalize("NFC");
}

/** @param {string} source */
function transliterateWord(source) {
  const word = source.toLocaleLowerCase("ru-RU");

  let result = "";
  let index = 0;

  while (index < word.length) {
    const current = word[index];

    if (current === "л") {
      const rendered = transliterateL(word, index);
      result += rendered.text;
      index += rendered.length;
      continue;
    }

    const pairedConsonant = PAIRED_CONSONANTS[current];
    if (pairedConsonant) {
      const rendered = transliteratePairedConsonant(
        word,
        index,
        pairedConsonant,
      );
      result += rendered.text;
      index += rendered.length;
      continue;
    }

    const unpairedConsonant = UNPAIRED_CONSONANTS[current];
    if (unpairedConsonant) {
      const rendered = transliterateUnpairedConsonant(
        word,
        index,
        unpairedConsonant,
      );
      result += rendered.text;
      index += rendered.length;
      continue;
    }

    if (current === "й") {
      result += "j";
      index += 1;
      continue;
    }

    if (PLAIN_VOWELS[current]) {
      result += PLAIN_VOWELS[current];
      index += 1;
      continue;
    }

    if (IOTATED_VOWELS[current]) {
      result += `j${IOTATED_VOWELS[current]}`;
      index += 1;
      continue;
    }

    if (current === "ъ" || current === "ь") {
      const followingVowel = SEPARATED_VOWELS[word[index + 1]];
      if (followingVowel) {
        result += `j${followingVowel}`;
        index += 2;
      } else {
        index += 1;
      }
      continue;
    }

    result += current;
    index += 1;
  }

  return result.normalize("NFC");
}

/**
 * Handle consonant + ь/ъ (+ separated vowel). `forms` gives the output for
 * each sign; a following vowel adds a separating j.
 *
 * @param {string} word
 * @param {number} index
 * @param {{ soft: string, hard: string }} forms
 */
function applySign(word, index, forms) {
  const sign = word[index + 1];
  if (sign !== "ь" && sign !== "ъ") return null;

  const base = sign === "ь" ? forms.soft : forms.hard;
  const vowel = SEPARATED_VOWELS[word[index + 2]];
  return vowel
    ? { text: `${base}j${vowel}`, length: 3 }
    : { text: base, length: 2 };
}

/**
 * @param {string} word
 * @param {number} index
 * @param {{ hard: string, soft: string }} consonant
 */
function transliteratePairedConsonant(word, index, consonant) {
  const signed = applySign(word, index, consonant);
  if (signed) return signed;

  const next = word[index + 1];
  const afterNext = word[index + 2];

  if (IOTATED_VOWELS[next]) {
    return { text: `${consonant.hard}i${IOTATED_VOWELS[next]}`, length: 2 };
  }

  if (next === "и") {
    const vowel = NEEDS_SEPARATE_I.has(afterNext) ? "ï" : "i";
    return { text: `${consonant.hard}${vowel}`, length: 2 };
  }

  return { text: consonant.hard, length: 1 };
}

/** @param {string} word @param {number} index */
function transliterateL(word, index) {
  const signed = applySign(word, index, { soft: "l", hard: "ł" });
  if (signed) return signed;

  const next = word[index + 1];

  if (IOTATED_VOWELS[next]) {
    return { text: `l${IOTATED_VOWELS[next]}`, length: 2 };
  }

  if (next === "и") {
    return { text: "li", length: 2 };
  }

  if (PLAIN_VOWELS[next]) {
    return { text: `ł${PLAIN_VOWELS[next]}`, length: 2 };
  }

  return { text: "ł", length: 1 };
}

/**
 * @param {string} word
 * @param {number} index
 * @param {string} consonant
 */
function transliterateUnpairedConsonant(word, index, consonant) {
  const signed = applySign(word, index, { soft: consonant, hard: consonant });
  if (signed) return signed;

  const next = word[index + 1];

  if (IOTATED_VOWELS[next]) {
    return { text: `${consonant}${IOTATED_VOWELS[next]}`, length: 2 };
  }

  if (PLAIN_VOWELS[next]) {
    return { text: `${consonant}${PLAIN_VOWELS[next]}`, length: 2 };
  }

  return { text: consonant, length: 1 };
}
