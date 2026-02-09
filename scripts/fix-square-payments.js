// scripts/fix-square-payments.js
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing react-native-square-in-app-payments package.json...');

const packagePath = path.join(__dirname, '../node_modules/react-native-square-in-app-payments/package.json');

try {
  const data = fs.readFileSync(packagePath, 'utf8');
  const pkg = JSON.parse(data);
  
  console.log('📦 Original package.json:', {
    main: pkg.main,
    types: pkg.types,
    hasExports: !!pkg.exports
  });
  
  // The exports field is correct but too restrictive
  // We need to add the missing subpath OR make it more permissive
  pkg.exports = {
    '.': {
      "source": "./src/index.ts",
      "import": "./src/index.ts",
      "require": "./src/index.ts",
      "default": "./src/index.ts"
    },
    './package.json': './package.json',
    './app.plugin.js': './app.plugin.js',
    // ADD THIS to allow direct import
    './src/index.ts': './src/index.ts'
  };
  
  // Also ensure main and types are correct
  pkg.main = './src/index.ts';
  pkg.types = './src/index.ts';
  
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
  console.log('✅ Fixed exports field to include ./src/index.ts');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}