// scripts/fix-square-payments.js
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Square SDK package.json exports for EAS...');

const packagePath = path.join(__dirname, '../node_modules/react-native-square-in-app-payments/package.json');

try {
  if (fs.existsSync(packagePath)) {
    const data = fs.readFileSync(packagePath, 'utf8');
    const pkg = JSON.parse(data);
    
    // Explicitly define exports so Expo/Metro can find the source and plugin
    pkg.exports = {
      '.': {
        import: './src/index.ts',
        require: './src/index.ts',
        types: './src/index.ts',
        default: './src/index.ts',
      },
      './package.json': './package.json',
      './app.plugin.js': './app.plugin.js',
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
