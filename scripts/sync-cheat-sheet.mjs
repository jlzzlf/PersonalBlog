import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourceDir = resolve('cheat_sheet');
const targetDir = resolve('public', 'cheat_sheet');

await mkdir(targetDir, { recursive: true });
await cp(sourceDir, targetDir, { recursive: true, force: true });

console.log('Synced cheat_sheet to public/cheat_sheet');
