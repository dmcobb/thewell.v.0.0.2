// scripts/patch-square-frameworks.js
const fs = require('fs');
const path = require('path');

console.log('🔧 Patching Square iOS frameworks in node_modules...');

const frameworkPaths = [
  './node_modules/react-native-square-in-app-payments/ios/Frameworks/SquareInAppPaymentsSDK.framework',
  './node_modules/react-native-square-in-app-payments/ios/Frameworks/SquareBuyerVerificationSDK.framework',
  './node_modules/react-native-square-in-app-payments/ios/Frameworks/CorePaymentCard.framework'
];

frameworkPaths.forEach(frameworkPath => {
  const fullPath = path.resolve(frameworkPath);
  if (fs.existsSync(fullPath)) {
    console.log(`\n📦 Processing: ${frameworkPath}`);
    
    // Handle the main Square frameworks
    if (frameworkPath.includes('SquareInAppPaymentsSDK') || frameworkPath.includes('SquareBuyerVerificationSDK')) {
      
      // Check for nested Frameworks folder
      const nestedFrameworksPath = path.join(fullPath, 'Frameworks');
      const corePaymentCardSource = path.join(nestedFrameworksPath, 'CorePaymentCard.framework');
      const corePaymentCardDest = path.join(path.dirname(fullPath), 'CorePaymentCard.framework');
      
      // Move CorePaymentCard if it exists in nested folder
      if (fs.existsSync(corePaymentCardSource)) {
        console.log(`  Found CorePaymentCard.framework in nested folder`);
        
        // Ensure destination doesn't already exist
        if (fs.existsSync(corePaymentCardDest)) {
          fs.rmSync(corePaymentCardDest, { recursive: true, force: true });
        }
        
        // Move it
        fs.renameSync(corePaymentCardSource, corePaymentCardDest);
        console.log(`  ✅ Moved CorePaymentCard.framework to parent folder`);
      }
      
      // Delete the now-empty Frameworks folder
      if (fs.existsSync(nestedFrameworksPath)) {
        const remaining = fs.readdirSync(nestedFrameworksPath);
        if (remaining.length === 0) {
          fs.rmdirSync(nestedFrameworksPath);
          console.log(`  ✅ Removed empty Frameworks folder`);
        } else {
          console.log(`  ⚠️ Nested folder not empty: ${remaining.join(', ')}`);
        }
      }
      
      // Delete setup script
      const setupScript = path.join(fullPath, 'setup');
      if (fs.existsSync(setupScript)) {
        fs.unlinkSync(setupScript);
        console.log(`  ✅ Deleted setup script`);
      }
      
      // Delete any shell scripts
      const files = fs.readdirSync(fullPath);
      files.forEach(file => {
        if (file.endsWith('.sh')) {
          fs.unlinkSync(path.join(fullPath, file));
          console.log(`  ✅ Deleted ${file}`);
        }
      });
    }
    
    console.log(`  ✅ Framework cleaned`);
  } else {
    console.log(`\n⚠️ Framework not found: ${frameworkPath}`);
  }
});

// Also check the root Frameworks folder for CorePaymentCard
const rootCorePaymentCard = './node_modules/react-native-square-in-app-payments/ios/Frameworks/CorePaymentCard.framework';
if (fs.existsSync(rootCorePaymentCard)) {
  console.log(`\n✅ CorePaymentCard.framework already in correct location`);
}

console.log('\n🔍 Verifying final structure:');

const verifyStructure = () => {
  const baseDir = './node_modules/react-native-square-in-app-payments/ios/Frameworks/';
  if (fs.existsSync(baseDir)) {
    const files = fs.readdirSync(baseDir);
    console.log('📋 Frameworks directory contents:');
    files.forEach(file => {
      const stat = fs.statSync(path.join(baseDir, file));
      console.log(`  - ${file}${stat.isDirectory() ? '/' : ''}`);
      
      // If it's a Square framework, check its contents
      if (file.includes('Square') && stat.isDirectory()) {
        const frameworkContents = fs.readdirSync(path.join(baseDir, file));
        console.log(`    Contents: ${frameworkContents.join(', ')}`);
        
        // Specifically check for setup script
        if (frameworkContents.includes('setup')) {
          console.log(`    ❌ setup script STILL PRESENT!`);
        }
        if (frameworkContents.includes('Frameworks')) {
          console.log(`    ❌ Frameworks folder STILL PRESENT!`);
        }
      }
    });
  }
};

verifyStructure();

console.log('\n🎉 Square framework patching complete!');