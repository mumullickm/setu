// Copies the 108 ElevenLabs clips from ../player/audio into public/audio, so the web app and the APK serve them offline.
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(web, '..', 'player', 'audio');
const dst = join(web, 'public', 'audio');
if (!existsSync(src)) throw new Error('player/audio not found next to web/');
mkdirSync(dst, { recursive: true });
const clips = readdirSync(src).filter((f) => f.endsWith('.mp3'));
for (const f of clips) cpSync(join(src, f), join(dst, f));
console.log(`assets: ${clips.length} clips`);
