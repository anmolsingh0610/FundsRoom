const fs = require('fs');
const path = require('path');
const replaceInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (content.includes('../generated/prisma')) {
    content = content.replace(/\.\.\/generated\/prisma/g, '@prisma/client');
    changed = true;
  }
  if (content.includes('../src/generated/prisma')) {
    content = content.replace(/\.\.\/src\/generated\/prisma/g, '@prisma/client');
    changed = true;
  }
  if (changed) fs.writeFileSync(file, content);
};
const scan = (dir) => {
  fs.readdirSync(dir).forEach(f => {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory() && f !== 'generated') scan(fullPath);
    else if (fullPath.endsWith('.ts')) replaceInFile(fullPath);
  });
};
scan('D:/crm/backend/src');
scan('D:/crm/backend/prisma');

// Fix schema.prisma
const schemaFile = 'D:/crm/backend/prisma/schema.prisma';
let schema = fs.readFileSync(schemaFile, 'utf8');
schema = schema.replace(/output\s*=\s*"[^"]+"\n/g, '');
fs.writeFileSync(schemaFile, schema);
