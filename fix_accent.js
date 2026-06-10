// fix_accent.js – Decode mis‑encoded Latin‑1 characters in classification data files
const fs = require('fs');
const path = require('path');

// Directory containing the data files (same folder as this script)
const dir = __dirname;

// Helper to decode a string that was interpreted as Latin‑1 instead of UTF‑8
function decodeLatin1(str) {
  return Buffer.from(str, 'latin1').toString('utf8');
}

fs.readdirSync(dir)
  .filter((f) => f.endsWith('.js'))
  .forEach((file) => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace all double‑quoted string literals with decoded versions
    const fixed = content.replace(/"([^"\\]*?)"/g, (match, p1) => {
      const decoded = decodeLatin1(p1);
      const escaped = decoded.replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`Fixed accents in ${file}`);
    }
  });
