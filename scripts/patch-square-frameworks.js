// scripts/patch-square-frameworks.js
const fs = require('fs');
const path = require('path');

console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
console.log('🔴 SCRIPT IS DEFINITELY RUNNING');
console.log('🔴 Time: ' + new Date().toISOString());
console.log('🔴 Current dir: ' + process.cwd());
console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
console.log('');

// This is where Xcode is copying from
const frameworkPaths = [
  './ios/Pods/SquareInAppPaymentsSDK/XCFrameworks/SquareInAppPaymentsSDK.xcframework/ios-arm64/SquareInAppPaymentsSDK.framework',
  './ios/Pods/SquareBuyerVerificationSDK/XCFrameworks/SquareBuyerVerificationSDK.xcframework/ios-arm64/SquareBuyerVerificationSDK.framework'
];

frameworkPaths.forEach(frameworkPath => {
  const fullPath = path.resolve(frameworkPath);
  console.log(`\n🔍 Checking: ${frameworkPath}`);
  console.log(`   Full path: ${fullPath}`);
  console.log(`   Exists? ${fs.existsSync(fullPath)}`);
  
  if (fs.existsSync(fullPath)) {
    // Delete setup script
    const setupScript = path.join(fullPath, 'setup');
    if (fs.existsSync(setupScript)) {
      fs.unlinkSync(setupScript);
      console.log(`   ✅ Deleted setup script`);
    } else {
      console.log(`   ⚠️ setup script not found`);
    }
    
    // Handle nested Frameworks folder
    const nestedFrameworksPath = path.join(fullPath, 'Frameworks');
    if (fs.existsSync(nestedFrameworksPath)) {
      console.log(`   Found nested Frameworks folder`);
      
      // Check for CorePaymentCard
      const corePaymentCardPath = path.join(nestedFrameworksPath, 'CorePaymentCard.framework');
      const destinationPath = path.join(fullPath, 'CorePaymentCard.framework');
      
      if (fs.existsSync(corePaymentCardPath)) {
        // Move CorePaymentCard up
        if (fs.existsSync(destinationPath)) {
          fs.rmSync(destinationPath, { recursive: true, force: true });
        }
        fs.renameSync(corePaymentCardPath, destinationPath);
        console.log(`   ✅ Moved CorePaymentCard.framework to parent`);
      }
      
      // Delete the now-empty Frameworks folder
      const remaining = fs.readdirSync(nestedFrameworksPath);
      if (remaining.length === 0) {
        fs.rmdirSync(nestedFrameworksPath);
        console.log(`   ✅ Removed empty Frameworks folder`);
      } else {
        console.log(`   ⚠️ Nested folder not empty: ${remaining.join(', ')}`);
      }
    }
    
    // Verify the fixes
    console.log(`\n   📋 Final contents of ${path.basename(frameworkPath)}:`);
    const finalContents = fs.readdirSync(fullPath);
    console.log(`   ${finalContents.join(', ')}`);
    
    if (finalContents.includes('setup')) {
      console.log(`   ❌ ERROR: setup script STILL PRESENT!`);
    }
    if (finalContents.includes('Frameworks')) {
      console.log(`   ❌ ERROR: Frameworks folder STILL PRESENT!`);
    }
  }
});

console.log('\n🎉 [SQUARE-PATCH] SCRIPT COMPLETE');