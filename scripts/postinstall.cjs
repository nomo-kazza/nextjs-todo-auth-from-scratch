const fs = require('fs');
const path = require('path');
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
console.log('Ensured data directory exists at', dbDir);
