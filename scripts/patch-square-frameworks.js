// scripts/patch-square-frameworks.js
const fs = require('fs');
const path = require('path');

console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
console.log('🔴 SCRIPT IS DEFINITELY RUNNING');
console.log('🔴 Time: ' + new Date().toISOString());
console.log('🔴 Current dir: ' + process.cwd());
console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
console.log('');

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
    // Delete setup script (for SquareInAppPaymentsSDK)
    const setupScript = path.join(fullPath, 'setup');
    if (fs.existsSync(setupScript)) {
      fs.unlinkSync(setupScript);
      console.log(`   ✅ Deleted setup script`);
    }
    
    // Handle nested Frameworks folder
    const nestedFrameworksPath = path.join(fullPath, 'Frameworks');
    if (fs.existsSync(nestedFrameworksPath)) {
      console.log(`   Found nested Frameworks folder`);
      
      // For SquareBuyerVerificationSDK, move ThreeDS_SDK up
      const threeDSPath = path.join(nestedFrameworksPath, 'ThreeDS_SDK.framework');
      const destinationThreeDSPath = path.join(fullPath, 'ThreeDS_SDK.framework');
      
      if (fs.existsSync(threeDSPath)) {
        console.log(`   Found ThreeDS_SDK.framework in nested folder`);
        
        // Move ThreeDS_SDK up
        if (fs.existsSync(destinationThreeDSPath)) {
          fs.rmSync(destinationThreeDSPath, { recursive: true, force: true });
        }
        fs.renameSync(threeDSPath, destinationThreeDSPath);
        console.log(`   ✅ Moved ThreeDS_SDK.framework to parent`);
      }
      
      // Check for CorePaymentCard (for SquareInAppPaymentsSDK)
      const corePaymentCardPath = path.join(nestedFrameworksPath, 'CorePaymentCard.framework');
      const destinationCorePath = path.join(fullPath, 'CorePaymentCard.framework');
      
      if (fs.existsSync(corePaymentCardPath)) {
        console.log(`   Found CorePaymentCard.framework in nested folder`);
        
        if (fs.existsSync(destinationCorePath)) {
          fs.rmSync(destinationCorePath, { recursive: true, force: true });
        }
        fs.renameSync(corePaymentCardPath, destinationCorePath);
        console.log(`   ✅ Moved CorePaymentCard.framework to parent`);
      }
      
      // Now check if Frameworks folder is empty and remove it
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
    
    // Check for nested frameworks at root level (they're okay here)
    if (finalContents.includes('ThreeDS_SDK.framework')) {
      console.log(`   ✅ ThreeDS_SDK.framework is now at root level (correct)`);
    }
    if (finalContents.includes('CorePaymentCard.framework')) {
      console.log(`   ✅ CorePaymentCard.framework is now at root level (correct)`);
    }
  }
});

console.log('\n🎉 [SQUARE-PATCH] SCRIPT COMPLETE');