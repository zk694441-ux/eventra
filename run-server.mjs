// Bootstrap script to launch the Express server from the root
import { createRequire } from 'module';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverDir = join(__dirname, 'server');

const child = spawn('node', ['index.js'], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: false,
});

child.on('error', err => { console.error('Server failed:', err); process.exit(1); });
child.on('exit', code => process.exit(code));
