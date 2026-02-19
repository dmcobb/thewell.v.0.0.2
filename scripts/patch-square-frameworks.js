// scripts/patch-square-frameworks.js
const fs = require('fs');
const path = require('path');

console.log('🔧 Patching Square iOS frameworks correctly...');

const frameworkPaths = [
  './ios/Pods/SquareInAppPaymentsSDK/SquareInAppPaymentsSDK.framework',
  './ios/Pods/SquareBuyerVerificationSDK/SquareBuyerVerificationSDK.framework'
];

frameworkPaths.forEach(frameworkPath => {
  const fullPath = path.resolve(frameworkPath);
  if (fs.existsSync(fullPath)) {
    console.log(`\n📦 Processing: ${frameworkPath}`);
    
    // Check for nested Frameworks folder containing CorePaymentCard
    const nestedFrameworksPath = path.join(fullPath, 'Frameworks');
    const corePaymentCardPath = path.join(nestedFrameworksPath, 'CorePaymentCard.framework');
    const destinationPath = path.join(fullPath, 'CorePaymentCard.framework');
    
    // If CorePaymentCard exists in nested folder, MOVE it up one level
    if (fs.existsSync(corePaymentCardPath)) {
      console.log(`  Found CorePaymentCard.framework in nested folder`);
      
      // Move it to the parent framework folder
      fs.renameSync(corePaymentCardPath, destinationPath);
      console.log(`  ✅ Moved CorePaymentCard.framework to parent folder`);
      
      // Now delete the empty Frameworks folder
      if (fs.existsSync(nestedFrameworksPath)) {
        // Check if anything else is in there
        const remaining = fs.readdirSync(nestedFrameworksPath);
        if (remaining.length === 0) {
          fs.rmdirSync(nestedFrameworksPath);
          console.log(`  ✅ Removed empty Frameworks folder`);
        } else {
          console.log(`  ⚠️ Nested Frameworks folder not empty: ${remaining.join(', ')}`);
        }
      }
    }
    
    // Delete setup script
    const setupScript = path.join(fullPath, 'setup');
    if (fs.existsSync(setupScript)) {
      fs.unlinkSync(setupScript);
      console.log(`  ✅ Deleted setup script`);
    }
    
    // Delete any other shell scripts
    const files = fs.readdirSync(fullPath);
    files.forEach(file => {
      if (file.endsWith('.sh') || file.endsWith('.pl')) {
        fs.unlinkSync(path.join(fullPath, file));
        console.log(`  ✅ Deleted ${file}`);
      }
    });
    
    console.log(`  ✅ Framework cleaned`);
  } else {
    console.log(`\n⚠️ Framework not found: ${frameworkPath}`);
  }
});

// Verify CorePaymentCard is now accessible
console.log('\n🔍 Verifying CorePaymentCard.framework locations:');

const verifyPaths = [
  './ios/Pods/SquareInAppPaymentsSDK/SquareInAppPaymentsSDK.framework/CorePaymentCard.framework',
  './ios/Pods/SquareBuyerVerificationSDK/SquareBuyerVerificationSDK.framework/CorePaymentCard.framework'
];

verifyPaths.forEach(verifyPath => {
  if (fs.existsSync(verifyPath)) {
    console.log(`  ✅ Found: ${verifyPath}`);
  } else {
    console.log(`  ❌ Missing: ${verifyPath}`);
  }
});

console.log('\n🎉 Square framework patching complete!');