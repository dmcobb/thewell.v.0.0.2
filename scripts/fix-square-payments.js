const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing react-native-square-in-app-payments package.json...');

const packagePath = path.join(__dirname, '../node_modules/react-native-square-in-app-payments/package.json');

try {
  // Read the package.json
  const data = fs.readFileSync(packagePath, 'utf8');
  const pkg = JSON.parse(data);
  
  console.log('📦 Current package.json:', {
    main: pkg.main,
    hasExports: !!pkg.exports,
    exportsValue: pkg.exports
  });
  
  // FIX 1: Ensure main points to the correct file
  if (pkg.main && pkg.main.includes('lib/module')) {
    pkg.main = './src/index.js';
    console.log('✅ Fixed main field');
  }
  
  // FIX 2: Remove or fix the broken exports field
  if (pkg.exports) {
    // Option A: Remove it completely
    delete pkg.exports;
    console.log('✅ Removed broken exports field');
    
    // Option B: Or fix it if you want to keep it
    // pkg.exports = {
    //   ".": "./src/index.js"
    // };
  }
  
  // Write it back
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
  console.log('🎯 Successfully fixed package.json');
  
} catch (error) {
  console.error('❌ Error fixing package:', error.message);
  process.exit(1);
}