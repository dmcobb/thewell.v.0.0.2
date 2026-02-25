// scripts/fix-square-payments.js
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Square SDK package.json exports for EAS...');

console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
console.log('🔴 SQUARE PATCH SCRIPT STARTED');
console.log('🔴 Time: ' + new Date().toISOString());
console.log('🔴 Current directory: ' + process.cwd());
console.log('🔴 EAS Build?: ' + (process.env.EAS_BUILD ? 'YES' : 'NO'));
console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');

const packagePath = path.join(__dirname, '../node_modules/react-native-square-in-app-payments/package.json');

try {
  if (fs.existsSync(packagePath)) {
    const data = fs.readFileSync(packagePath, 'utf8');
    const pkg = JSON.parse(data);
    
    // Explicitly define exports so Expo/Metro can find the source and plugin
    pkg.exports = {
      '.': {
        source: './src/index.ts',
        import: './src/index.ts',
        require: './src/index.ts',
        default: './src/index.ts',
      },
      './package.json': './package.json',
      './app.plugin.js': './app.plugin.js',
      './src/index.ts': './src/index.ts',
    };
    pkg.main = './src/index.ts';
    pkg.types = './src/index.ts';
    
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
    console.log('✅ Fixed package.json exports');
  } else {
    console.log('⚠️ Square package.json not found, skipping fix.');
  }
} catch (error) {
  console.error('❌ Error fixing package.json:', error.message);
}
