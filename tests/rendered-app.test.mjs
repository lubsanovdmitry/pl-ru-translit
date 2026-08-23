import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished transliterator", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Польская кириллица — транслитератор<\/title>/i);
  assert.match(html, /Польский,/);
  assert.match(html, /по-кириллически\./);
  assert.match(html, /<textarea[^>]*id="polish-input"/i);
  assert.match(html, /Шмяло! То пешнь пржышлошчи\./);
  assert.match(html, /aria-live="polite"/i);
  assert.match(html, /og\.png/i);
  assert.doesNotMatch(html, /codex-preview|Building your site|SkeletonPreview/i);
});

test("removes disposable starter assets and metadata", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /transliteratePolish/);
  assert.match(page, /navigator\.clipboard\.writeText/);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /Польская кириллица — транслитератор/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.doesNotMatch(layout, /Starter Project|next\/font/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton|site-creator-vinext-starter/);

  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
  await access(new URL("public/favicon.png", projectRoot));
  await access(new URL("public/og.png", projectRoot));
});
