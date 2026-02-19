// scripts/patch-square-frameworks.js
const fs = require('fs');
const path = require('path');

console.log('🔧 Patching Square iOS frameworks in Pods XCFrameworks...');

const frameworkPaths = [
  './ios/Pods/SquareInAppPaymentsSDK/XCFrameworks/SquareInAppPaymentsSDK.xcframework/ios-arm64/SquareInAppPaymentsSDK.framework',
  './ios/Pods/SquareBuyerVerificationSDK/XCFrameworks/SquareBuyerVerificationSDK.xcframework/ios-arm64/SquareBuyerVerificationSDK.framework'
];

frameworkPaths.forEach(frameworkPath => {
  const fullPath = path.resolve(frameworkPath);
  if (fs.existsSync(fullPath)) {
    console.log(`\n📦 Processing: ${frameworkPath}`);
    
    // Delete setup script
    const setupScript = path.join(fullPath, 'setup');
    if (fs.existsSync(setupScript)) {
      fs.unlinkSync(setupScript);
      console.log(`  ✅ Deleted setup script`);
    }
    
    // Handle nested Frameworks folder with CorePaymentCard
    const nestedFrameworksPath = path.join(fullPath, 'Frameworks');
    const corePaymentCardPath = path.join(nestedFrameworksPath, 'CorePaymentCard.framework');
    const destinationPath = path.join(fullPath, 'CorePaymentCard.framework');
    
    if (fs.existsSync(corePaymentCardPath)) {
      console.log(`  Found CorePaymentCard.framework in nested folder`);
      
      // Move CorePaymentCard up one level
      if (fs.existsSync(destinationPath)) {
        fs.rmSync(destinationPath, { recursive: true, force: true });
      }
      fs.renameSync(corePaymentCardPath, destinationPath);
      console.log(`  ✅ Moved CorePaymentCard.framework to parent`);
      
      // Remove the now-empty Frameworks folder
      if (fs.existsSync(nestedFrameworksPath)) {
        const remaining = fs.readdirSync(nestedFrameworksPath);
        if (remaining.length === 0) {
          fs.rmdirSync(nestedFrameworksPath);
          console.log(`  ✅ Removed empty Frameworks folder`);
        }
      }
    }
  } else {
    console.log(`\n⚠️ Framework not found: ${frameworkPath}`);
  }
});

console.log('\n✅ Patching complete');