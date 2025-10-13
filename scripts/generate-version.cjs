const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, '..', 'public', 'version.json');
const version = {
  version: new Date().toISOString()
};

fs.writeFileSync(outPath, JSON.stringify(version));
console.log('Wrote', outPath, version);


