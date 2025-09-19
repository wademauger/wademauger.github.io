#!/usr/bin/env node
/**
 * Migration utility to help convert .js/.jsx files to .ts/.tsx
 * Usage: node scripts/migrate-to-ts.js [file-pattern]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files to migrate (you can modify this list)
const filesToMigrate = [
  'src/types/index.ts', // Already TypeScript
  // Add more files here as you migrate them
];

// Function to convert a .js file to .tsx
function migrateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  const ext = path.extname(filePath);
  const newExt = ext === '.js' ? '.tsx' : '.ts';
  const newFilePath = filePath.replace(ext, newExt);

  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Basic TypeScript conversion patterns
    content = addBasicTypes(content);
    
    // Rename the file
    fs.renameSync(filePath, newFilePath);
    
    // Write the updated content
    fs.writeFileSync(newFilePath, content, 'utf8');
    
    console.log(`✅ Migrated: ${filePath} → ${newFilePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to migrate ${filePath}:`, error.message);
    return false;
  }
}

// Basic type additions for common patterns
function addBasicTypes(content) {
  // Add React import if it's a component file and doesn't have it
  if (content.includes('export default') && content.includes('React') && !content.includes("import React")) {
    content = "import React from 'react';\n" + content;
  }
  
  // Add basic props interface for functional components
  if (content.includes('= ({') && !content.includes('interface') && !content.includes('Props')) {
    const componentName = extractComponentName(content);
    if (componentName) {
      const propsInterface = `interface ${componentName}Props {\n  // TODO: Add prop types\n}\n\n`;
      content = content.replace(`const ${componentName} = ({`, `${propsInterface}const ${componentName} = ({`);
    }
  }
  
  return content;
}

// Extract component name from file content
function extractComponentName(content) {
  const match = content.match(/const (\w+) = \(/);
  return match ? match[1] : null;
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
TypeScript Migration Helper

Usage:
  node scripts/migrate-to-ts.js <file-path>
  
Example:
  node scripts/migrate-to-ts.js src/components/MyComponent.js
  
This will:
  1. Rename .js to .tsx (or .ts for non-React files)
  2. Add basic TypeScript patterns
  3. Add React import if needed
    `);
    process.exit(0);
  }
  
  const filePath = args[0];
  migrateFile(filePath);
}

module.exports = { migrateFile, addBasicTypes };