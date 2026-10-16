// Static build for the APK: route handlers cannot be exported, so src/app/api is moved aside for the build and put back after.
import { execSync } from 'node:child_process';
import { renameSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const api = join(web, 'src', 'app', 'api');
const off = join(web, 'src', 'api.off');
if (!process.env.NEXT_PUBLIC_API_BASE) throw new Error('set NEXT_PUBLIC_API_BASE to the deployed web origin');
if (existsSync(off)) throw new Error('src/api.off exists: a previous app build did not restore it');
renameSync(api, off);
try {
  execSync('npx next build', { cwd: web, stdio: 'inherit', env: { ...process.env, CAP_BUILD: '1' } });
  execSync('npx cap sync android', { cwd: web, stdio: 'inherit' });
} finally {
  renameSync(off, api);
}
