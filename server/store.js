import fs from 'fs';
import path from 'path';

/**
 * Tiny JSON-file store with:
 *  - atomic writes (write temp file, then rename)
 *  - serialized updates (no lost writes between concurrent requests)
 *  - rolling backups of the previous version
 *  - no silent wipe: a corrupt file throws instead of being treated as empty
 */
export function createJsonStore(filePath, { backupDir, maxBackups = 20 } = {}) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, '.json');
  const backups = backupDir || path.join(dir, 'backups');
  fs.mkdirSync(backups, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}', 'utf-8');

  const read = () => JSON.parse(fs.readFileSync(filePath, 'utf-8') || '{}');

  const backup = () => {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync(filePath, path.join(backups, `${base}-${stamp}.json`));
    const list = fs
      .readdirSync(backups)
      .filter((f) => f.startsWith(`${base}-`))
      .sort();
    for (const old of list.slice(0, Math.max(0, list.length - maxBackups))) {
      fs.unlinkSync(path.join(backups, old));
    }
  };

  const write = (data) => {
    backup();
    const tmp = `${filePath}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, filePath);
  };

  let queue = Promise.resolve();

  /** Run fn(data) under a lock. If fn returns { changed: false }, nothing is written. */
  const update = (fn) => {
    const run = queue.then(() => {
      const data = read();
      const result = fn(data);
      if (!result || result.changed !== false) write(data);
      return result?.value;
    });
    queue = run.catch(() => {});
    return run;
  };

  return { read, update };
}
