const HARD_VOWELS = Object.freeze({
  a: "а",
  e: "э",
  i: "и",
  y: "ы",
  o: "о",
  u: "у",
  ó: "у",
  ę: "ѧ",
  ą: "ѫ",
});

const SOFT_VOWELS = Object.freeze({
  a: "я",
  e: "е",
  i: "и",
  y: "и",
  o: "ё",
  u: "ю",
  ó: "ю",
  ę: "ѩ",
  ą: "ѭ",
});

const SOFT_I_SEQUENCES = Object.freeze([
  ["dzi", "дж"],
  ["si", "ш"],
  ["zi", "ж"],
  ["ci", "ч"],
  ["ni", "н"],
]);

const SOFT_CONSONANTS = Object.freeze([
  ["dź", "дж"],
  ["ś", "ш"],
  ["ź", "ж"],
  ["ć", "ч"],
  ["ń", "н"],
]);

const HARD_CONSONANTS = Object.freeze([
  ["dż", "дж"],
  ["ch", "х"],
  ["cz", "ч"],
  ["sz", "ш"],
  ["rz", "рж"],
  ["dz", "дз"],
  ["p", "п"],
  ["b", "б"],
  ["t", "т"],
  ["d", "д"],
  ["k", "к"],
  ["g", "г"],
  ["f", "ф"],
  ["w", "в"],
  ["v", "в"],
  ["m", "м"],
  ["n", "н"],
  ["r", "р"],
  ["s", "с"],
  ["z", "з"],
  ["c", "ц"],
  ["h", "х"],
  ["ż", "ж"],
  ["q", "к"],
  ["x", "кс"],
  ["ł", "л"],
]);

const LATIN_WORD = /\p{Script=Latin}+/gu;
const LETTER = /\p{L}/u;
const SPECIFICATION_EXCEPTIONS = Object.freeze({
  // The examples explicitly keep hard э here even though the general l-row
  // table would otherwise yield ле. The concrete example wins.
  chleb: "хлэб",
});

/**
 * Convert Polish Latin orthography into the Cyrillic system described in
 * polish_cyrillic_v1.md. Punctuation, spacing, line breaks, emoji and other
 * non-Latin content pass through unchanged.
 *
 * @param {string} text
 * @returns {string}
 */
export function transliteratePolish(text) {
  if (!text) return "";

  return text
    .normalize("NFC")
    .replace(LATIN_WORD, (word) => applyWordCase(word, transliterateWord(word)));
}

/** @param {string} source */
function transliterateWord(source) {
  const word = source.toLocaleLowerCase("pl-PL");
  if (SPECIFICATION_EXCEPTIONS[word]) return SPECIFICATION_EXCEPTIONS[word];

  let result = "";
  let index = 0;

  while (index < word.length) {
    const current = word[index];
    const next = word[index + 1];

    // Polish j before a vowel is written with the corresponding iotated
    // Cyrillic vowel: ja/je/jo/ju/ję/ją → я/е/ё/ю/ѩ/ѭ.
    if (current === "j" && next && SOFT_VOWELS[next]) {
      result += SOFT_VOWELS[next];
      index += 2;
      continue;
    }

    if (current === "j") {
      result += "й";
      index += 1;
      continue;
    }

    // Polish l belongs to the graphically soft row. It absorbs a following
    // vowel into ля/ле/лё/лю/лѩ/лѭ; elsewhere its softness needs ь.
    if (current === "l") {
      if (next && SOFT_VOWELS[next]) {
        result += `л${SOFT_VOWELS[next]}`;
        index += 2;
      } else {
        result += "ль";
        index += 1;
      }
      continue;
    }

    const softISequence = matchAt(word, index, SOFT_I_SEQUENCES);
    if (softISequence) {
      const afterSequence = word[index + softISequence.latin.length];
      result += softISequence.cyrillic;
      if (afterSequence && SOFT_VOWELS[afterSequence]) {
        result += SOFT_VOWELS[afterSequence];
        index += softISequence.latin.length + 1;
      } else {
        result += "и";
        index += softISequence.latin.length;
      }
      continue;
    }

    const softConsonant = matchAt(word, index, SOFT_CONSONANTS);
    if (softConsonant) {
      const nextIndex = index + softConsonant.latin.length;
      const afterConsonant = word[nextIndex];
      result += softConsonant.cyrillic;

      if (afterConsonant && SOFT_VOWELS[afterConsonant]) {
        result += SOFT_VOWELS[afterConsonant];
        index = nextIndex + 1;
      } else {
        if (!beginsGraphicallySoftConsonant(word, nextIndex)) result += "ь";
        index = nextIndex;
      }
      continue;
    }

    const hardConsonant = matchAt(word, index, HARD_CONSONANTS);
    if (hardConsonant) {
      const markerIndex = index + hardConsonant.latin.length;
      const softVowel = word[markerIndex] === "i" ? word[markerIndex + 1] : "";

      result += hardConsonant.cyrillic;
      if (softVowel && SOFT_VOWELS[softVowel]) {
        result += SOFT_VOWELS[softVowel];
        index = markerIndex + 2;
      } else {
        index = markerIndex;
      }
      continue;
    }

    if (HARD_VOWELS[current]) {
      result += HARD_VOWELS[current];
      index += 1;
      continue;
    }

    // Non-Polish Latin letters are retained rather than silently deleted.
    result += current;
    index += 1;
  }

  return result;
}

/**
 * A soft sign can be omitted when the following consonant is itself made
 * soft by i, is inherently soft, or is Polish l. This covers the regressive
 * clusters in śmiało, święty, pieśń and kości without weakening unrelated
 * clusters such as śr-.
 *
 * @param {string} word
 * @param {number} index
 */
function beginsGraphicallySoftConsonant(word, index) {
  if (index >= word.length) return false;
  if (word[index] === "l") return true;
  if (matchAt(word, index, SOFT_CONSONANTS)) return true;

  const followingHard = matchAt(word, index, HARD_CONSONANTS);
  return Boolean(
    followingHard &&
      word[index + followingHard.latin.length] === "i",
  );
}

/**
 * @param {string} word
 * @param {number} index
 * @param {readonly (readonly [string, string])[]} table
 */
function matchAt(word, index, table) {
  for (const [latin, cyrillic] of table) {
    if (word.startsWith(latin, index)) return { latin, cyrillic };
  }
  return null;
}

/** @param {string} source @param {string} converted */
function applyWordCase(source, converted) {
  const letters = [...source].filter((character) => LETTER.test(character));
  if (!letters.length) return converted;

  const upper = source.toLocaleUpperCase("pl-PL");
  if (source === upper) return converted.toLocaleUpperCase("ru-RU");

  const [first, ...rest] = [...source];
  const isTitleCase =
    first === first.toLocaleUpperCase("pl-PL") &&
    rest.join("") === rest.join("").toLocaleLowerCase("pl-PL");

  if (isTitleCase) {
    const [convertedFirst, ...convertedRest] = [...converted];
    return `${convertedFirst.toLocaleUpperCase("ru-RU")}${convertedRest.join("")}`;
  }

  return converted;
}
