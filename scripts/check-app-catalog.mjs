import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';

export function checkAppCatalog() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const catalog = JSON.parse(readFileSync(join(root, 'api/v1/apps.json'), 'utf8'));
  const locales = ['ja','en-US','zh-Hans','zh-Hant','ko','es-ES','fr-FR','de-DE','it','pt-BR','ru','nl-NL','pl','sv','tr','th','vi','id','hi'].sort();
  assert.equal(catalog.schemaVersion, 1);
  assert(Number.isFinite(Date.parse(catalog.generatedAt)));
  assert(catalog.apps.length > 0);
  const ids = new Set(), orders = new Set(), storeIds = new Set();
  for (const app of catalog.apps) {
    assert(/^[A-Za-z0-9.-]+$/.test(app.id) && !ids.has(app.id), `Invalid/duplicate id: ${app.id}`);
    assert(Number.isInteger(app.order) && !orders.has(app.order), `Invalid/duplicate order: ${app.id}`);
    ids.add(app.id); orders.add(app.order);
    const url = new URL(app.appStoreURL);
    assert(url.protocol === 'https:' && url.hostname === 'apps.apple.com', `Store URL: ${app.id}`);
    const storeId = url.pathname.match(/id(\d+)/)?.[1];
    assert(storeId && !storeIds.has(storeId), `Missing/duplicate Store ID: ${app.id}`);
    storeIds.add(storeId);
    assert.deepEqual(Object.keys(app.localizations).sort(), locales, `Locales: ${app.id}`);
    for (const text of Object.values(app.localizations)) {
      assert(typeof text.name === 'string' && text.name.trim());
      assert(typeof text.description === 'string' && text.description.trim());
    }
  }
  const lp = JSON.parse(readFileSync(join(root, 'data/apps.json'), 'utf8'));
  for (const app of lp.apps.filter(a => a.status === 'released' && a.appStoreId)) {
    assert(storeIds.has(app.appStoreId), `Public app missing from remote catalog: ${app.id}`);
  }
  return catalog;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log(`VALID app catalog: ${checkAppCatalog().apps.length} apps, 19 locales`);
}
