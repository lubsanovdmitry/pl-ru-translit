const LETTER = /\p{L}/u;

/**
 * Give `converted` the capitalisation of `source`: ALL CAPS, Title Case or as-is.
 *
 * @param {string} source word before conversion
 * @param {string} converted word after conversion
 * @param {string} sourceLocale locale used to judge the case of `source`
 * @param {string} targetLocale locale used to upper-case `converted`
 */
export function applyWordCase(source, converted, sourceLocale, targetLocale) {
  if (!converted) return "";

  const letters = [...source].filter((character) => LETTER.test(character));
  if (!letters.length) return converted;

  if (source === source.toLocaleUpperCase(sourceLocale)) {
    return converted.toLocaleUpperCase(targetLocale);
  }

  const [first, ...rest] = [...source];
  const isTitleCase =
    first === first.toLocaleUpperCase(sourceLocale) &&
    rest.join("") === rest.join("").toLocaleLowerCase(sourceLocale);

  if (isTitleCase) {
    const [convertedFirst, ...convertedRest] = [...converted];
    return `${convertedFirst.toLocaleUpperCase(targetLocale)}${convertedRest.join("")}`;
  }

  return converted;
}
