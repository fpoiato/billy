import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function loadBilly(files) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'frontend', 'js');
  const sandbox = { console: console };
  sandbox.window = sandbox;
  sandbox.Billy = {};
  const ctx = createContext(sandbox);
  const list = files || ['version.js', 'config.js', 'physics.js'];
  for (const f of list) {
    runInContext(readFileSync(join(root, f), 'utf8'), ctx);
  }
  return ctx.Billy;
}
