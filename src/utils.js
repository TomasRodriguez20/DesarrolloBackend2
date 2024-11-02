import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicPath = (...subpaths) => join(__dirname, 'public', ...subpaths);

export { __dirname, publicPath };
