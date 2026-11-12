import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("build emits a browser-only static site", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  const files = await readdir(new URL("../dist/", import.meta.url));

  assert.match(html, /<title>Транслитератор — польский и русский<\/title>/i);
  assert.match(html, /<div id="root"><\/div>/i);
  assert.match(html, /<script[^>]*type="module"[^>]*src="\.\/assets\//i);
  assert.deepEqual(files.sort(), ["assets", "favicon.png", "index.html"]);
  await assert.rejects(access(new URL("../dist/_worker.js", import.meta.url)));
});
