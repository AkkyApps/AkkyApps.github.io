#!/usr/bin/env node
// akkyapps-lp ビルドスクリプト(依存ゼロ・Node 標準ライブラリのみ)
//
//   node scripts/build.mjs        # data/apps.json + templates/index.template.html → index.html
//   node scripts/build.mjs --check # 生成結果が index.html と一致するか検証(CI/コミット前用)
//
// index.html は生成物。直接編集せず data/apps.json またはテンプレートを編集すること。

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "data", "apps.json"), "utf8"));
const template = readFileSync(join(root, "templates", "index.template.html"), "utf8");

const SUPPORTED_LOCALES = new Set([
  "ja", "en-US", "zh-Hans", "zh-Hant", "ko", "es-ES", "fr-FR", "de-DE", "it",
  "pt-BR", "ru", "nl-NL", "pl", "sv", "tr", "th", "vi", "id", "hi",
]);
const ALLOWED_APP_STORE_HOSTS = new Set(["apps.apple.com", "apple.co"]);

function validateRemoteCatalog(catalog) {
  if (catalog?.schemaVersion !== 1 || !Array.isArray(catalog.apps) || catalog.apps.length === 0) {
    throw new Error("remoteCatalog must use schemaVersion 1 and contain apps");
  }
  const ids = new Set();
  const orders = new Set();
  for (const app of catalog.apps) {
    if (!/^[A-Za-z0-9.-]+$/.test(app.id) || ids.has(app.id)) throw new Error(`Duplicate or invalid catalog ID: ${app.id}`);
    if (!Number.isInteger(app.order) || orders.has(app.order)) throw new Error(`Duplicate or invalid catalog order: ${app.order}`);
    ids.add(app.id);
    orders.add(app.order);

    const source = data.apps.find((candidate) => candidate.id === app.id.toLowerCase());
    if (!source || source.status !== "released" || source.appStoreUrl !== app.appStoreURL) {
      throw new Error(`Catalog app must match a released LP app: ${app.id}`);
    }
    const url = new URL(app.appStoreURL);
    if (url.protocol !== "https:" || !ALLOWED_APP_STORE_HOSTS.has(url.hostname.toLowerCase())) {
      throw new Error(`Invalid App Store URL: ${app.appStoreURL}`);
    }
    const localeKeys = Object.keys(app.localizations ?? {});
    if (localeKeys.length !== SUPPORTED_LOCALES.size || localeKeys.some((locale) => !SUPPORTED_LOCALES.has(locale))) {
      throw new Error(`Catalog app ${app.id} must contain exactly 19 supported locales`);
    }
    for (const [locale, localization] of Object.entries(app.localizations)) {
      if (!localization?.name?.trim() || !localization?.description?.trim()) {
        throw new Error(`Catalog app ${app.id} has an empty ${locale} localization`);
      }
    }
  }
}

validateRemoteCatalog(data.remoteCatalog);

const esc = (s) =>
  String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const escAttr = (s) => esc(s).replaceAll('"', "&quot;");

const APPLE_SVG =
  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.182 8.39C11.17 6.888 12.42 6.16 12.48 6.12c-.7-1.023-1.793-1.162-2.18-1.18-0.93-.094-1.814.549-2.285.549-.47 0-1.197-.535-1.97-.52-1.014.015-1.95.59-2.473 1.5C2.47 8.13 3.23 10.91 4.24 12.44c.5.722 1.098 1.537 1.884 1.508.754-.03 1.04-.487 1.952-.487.912 0 1.172.487 1.972.472.813-.014 1.326-.74 1.82-1.463.576-.836.812-1.651.824-1.693-.018-.008-1.528-.587-1.51-2.387z" fill="white"/><path d="M9.773 3.48C10.198 2.97 10.48 2.27 10.4 1.56c-.596.025-1.323.4-1.75.904-.388.45-.726 1.172-.635 1.86.666.05 1.34-.34 1.758-.844z" fill="white"/></svg>';

const EXT_ARROW_SVG = [
  '          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">',
  '            <path d="M4.5 2.5H10.5V8.5M10.5 2.5L2.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  "          </svg>",
].join("\n");

const DOWNLOAD_SVG = [
  '          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">',
  '            <path d="M6.5 1.5V8.5M6.5 8.5L3.5 5.5M6.5 8.5L9.5 5.5M2.5 11.5H10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  "          </svg>",
].join("\n");

function renderIcon(app) {
  const icon = app.icon;
  if (icon.type === "pair") {
    return [
      `        <div class="app-icon-pair" aria-label="${escAttr(app.name)} app icon, light and dark modes">`,
      `          <img class="mode-icon mode-icon--light" src="${icon.light}" alt="">`,
      `          <img class="mode-icon mode-icon--dark" src="${icon.dark}" alt="">`,
      "        </div>",
    ].join("\n");
  }
  if (icon.type === "silhouette") {
    return [
      '        <div class="app-icon app-icon--silhouette" aria-hidden="true">',
      '          <svg viewBox="0 0 48 48">',
      ...icon.paths.map((d) => `            <path d="${d}" />`),
      "          </svg>",
      "        </div>",
    ].join("\n");
  }
  if (icon.type === "emoji") {
    return `        <div class="app-icon icon-tool" style="display:flex;align-items:center;justify-content:center;font-size:28px;">${icon.emoji}</div>`;
  }
  // single
  return [
    '        <div class="app-icon">',
    `          <img src="${icon.src}" alt="${escAttr(app.name)} app icon">`,
    "        </div>",
  ].join("\n");
}

function renderLink(link) {
  if (link.type === "external") {
    return [
      `        <a class="open-tool-btn" href="${link.href}" target="_blank" rel="noopener" aria-label="${escAttr(link.aria)}">`,
      `          ${esc(link.label)}`,
      "        </a>",
    ].join("\n");
  }
  const svg = link.type === "download" ? DOWNLOAD_SVG : EXT_ARROW_SVG;
  return [
    `        <a class="open-tool-btn" href="${link.href}" aria-label="${escAttr(link.aria)}">`,
    `          ${esc(link.label)}`,
    svg,
    "        </a>",
  ].join("\n");
}

function renderFooter(app) {
  const parts = [];
  if (app.status === "coming") {
    parts.push('        <span class="coming-soon-badge">Coming Soon</span>');
  }
  if (app.appStoreUrl) {
    parts.push(
      [
        `        <a class="app-store-btn" href="${app.appStoreUrl}" target="_blank" rel="noopener" aria-label="Download ${escAttr(app.name)} on the App Store">`,
        `          ${APPLE_SVG}`,
        "          App Store",
        "        </a>",
      ].join("\n"),
    );
  }
  for (const link of app.links ?? []) parts.push(renderLink(link));
  if (parts.length === 0) return null;
  return ['      <div class="app-footer">', ...parts, "      </div>"].join("\n");
}

function renderCard(app) {
  const lines = [
    `    <!-- ${app.comment ?? app.name} -->`,
    `    <div class="app-card${app.status === "coming" ? " app-card--coming" : ""}">`,
    '      <div class="app-header">',
    renderIcon(app),
    '        <div class="app-meta">',
    `          <div class="app-name">${esc(app.name)}</div>`,
    `          <div class="app-category">${esc(app.category)}</div>`,
    "        </div>",
    "      </div>",
    `      <p class="app-desc">${esc(app.desc)}</p>`,
  ];
  if (app.features?.length) {
    lines.push(
      '      <ul class="tool-features">',
      ...app.features.map((f) => `        <li>${esc(f)}</li>`),
      "      </ul>",
    );
  }
  const footer = renderFooter(app);
  if (footer) lines.push(footer);
  lines.push("    </div>");
  return lines.join("\n");
}

function renderSection(section, apps) {
  const cards = apps.map(renderCard).join("\n\n");
  return [
    `<!-- ${section.comment} -->`,
    `<section class="apps-section" id="${section.id}">`,
    `  <div class="section-label">${esc(section.label)}</div>`,
    '  <div class="apps-grid">',
    "",
    cards,
    "",
    "  </div>",
    "</section>",
  ].join("\n");
}

function renderNewsItem(item) {
  const app = data.apps.find((a) => a.id === item.appId);
  const title = item.title ?? `${app?.name ?? item.appId} ${item.version} を公開しました`;
  const titleHtml = item.url
    ? `<a href="${item.url}" target="_blank" rel="noopener">${esc(title)}</a>`
    : esc(title);
  const lines = [
    '    <div class="news-item">',
    `      <div class="news-date">${esc(item.date)}</div>`,
    '      <div class="news-content">',
    `        <div class="news-title">${titleHtml}</div>`,
  ];
  if (item.body) {
    const body = Array.isArray(item.body) ? item.body.join("\n") : item.body;
    lines.push(`        <p class="news-text">${esc(body)}</p>`);
  }
  lines.push("      </div>", "    </div>");
  return lines.join("\n");
}

function renderNewsSection(news) {
  if (!news?.length) return "";
  const items = [...news]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map(renderNewsItem)
    .join("\n");
  return [
    "",
    "<!-- NEWS -->",
    '<section class="apps-section" id="news">',
    '  <div class="section-label">News</div>',
    '  <div class="news-list">',
    items,
    "  </div>",
    "</section>",
    "",
  ].join("\n");
}

// ── 組み立て ──
const sections = data.sections
  .map((s) => renderSection(s, data.apps.filter((a) => a.section === s.id)))
  .join("\n\n");

const navLinks = [
  ...data.sections.map((s) => `      <a class="nav-link" href="#${s.id}">${esc(s.label)}</a>`),
  ...(data.news?.length ? ['      <a class="nav-link" href="#news">News</a>'] : []),
].join("\n");

const html = template
  .replace("{{NAV_LINKS}}", navLinks)
  .replace("{{APP_SECTIONS}}", sections)
  .replace("{{NEWS_SECTION}}", renderNewsSection(data.news));

const outPath = join(root, "index.html");
const apiPath = join(root, "api", "v1", "apps.json");
const apiJSON = `${JSON.stringify(data.remoteCatalog, null, 2)}\n`;

if (process.argv.includes("--check")) {
  const current = readFileSync(outPath, "utf8");
  const currentAPI = existsSync(apiPath) ? readFileSync(apiPath, "utf8") : "";
  if (current !== html || currentAPI !== apiJSON) {
    console.error("MISMATCH: generated files are stale. Run: node scripts/build.mjs");
    process.exit(1);
  }
  console.log("OK: index.html and api/v1/apps.json are up to date.");
} else {
  writeFileSync(outPath, html);
  mkdirSync(dirname(apiPath), { recursive: true });
  writeFileSync(apiPath, apiJSON);
  console.log(`Wrote index.html and api/v1/apps.json (apps: ${data.remoteCatalog.apps.length})`);
}
