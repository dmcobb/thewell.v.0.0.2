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

  // NEW: Fix iOS framework structure after build
  const iosBuildPath = path.join(__dirname, '../ios/build');
  
  if (fs.existsSync(iosBuildPath)) {
    console.log('📱 Looking for iOS build to fix Square frameworks...');
    
    // Find the .app bundle
    const findApp = execSync('find ' + iosBuildPath + ' -name "*.app" -type d', { encoding: 'utf8' }).trim();
    
    if (findApp) {
      const appPath = findApp.split('\n')[0];
      const frameworksPath = path.join(appPath, 'Frameworks');
      
      if (fs.existsSync(frameworksPath)) {
        // Fix SquareInAppPaymentsSDK.framework
        const squareIAPPath = path.join(frameworksPath, 'SquareInAppPaymentsSDK.framework');
        if (fs.existsSync(squareIAPPath)) {
          console.log('🔨 Fixing SquareInAppPaymentsSDK.framework...');
          
          // Remove nested Frameworks folder (forbidden by Apple)
          const nestedFrameworks = path.join(squareIAPPath, 'Frameworks');
          if (fs.existsSync(nestedFrameworks)) {
            execSync(`rm -rf "${nestedFrameworks}"`);
            console.log('  ✅ Removed nested Frameworks folder');
          }
          
          // Remove or handle the 'setup' file
          const setupFile = path.join(squareIAPPath, 'setup');
          if (fs.existsSync(setupFile)) {
            // Option 1: Remove if not needed
            fs.unlinkSync(setupFile);
            console.log('  ✅ Removed setup file');
            
            // Option 2: If needed, we would need to sign it properly
            // This requires distribution certificate, which is complex in CI
          }
        }
        
        // Fix SquareBuyerVerificationSDK.framework
        const squareBVPath = path.join(frameworksPath, 'SquareBuyerVerificationSDK.framework');
        if (fs.existsSync(squareBVPath)) {
          console.log('🔨 Fixing SquareBuyerVerificationSDK.framework...');
          
          const nestedFrameworks = path.join(squareBVPath, 'Frameworks');
          if (fs.existsSync(nestedFrameworks)) {
            execSync(`rm -rf "${nestedFrameworks}"`);
            console.log('  ✅ Removed nested Frameworks folder');
          }
        }
        
        console.log('✅ Square frameworks fixed!');
      }
    }
  } else {
    console.log('⚠️ No iOS build found - skipping framework fixes');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}