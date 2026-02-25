// scripts/patch-square-frameworks.js
const fs = require('fs');
const path = require('path');

console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
console.log('🔴 SCRIPT IS DEFINITELY RUNNING');
console.log('🔴 Time: ' + new Date().toISOString());
console.log('🔴 Current dir: ' + process.cwd());
console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
console.log('');

// Source paths (where frameworks currently are)
const sourcePaths = {
  corePaymentCard: './ios/Pods/SquareInAppPaymentsSDK/XCFrameworks/SquareInAppPaymentsSDK.xcframework/ios-arm64/SquareInAppPaymentsSDK.framework/CorePaymentCard.framework',
  threeDS: './ios/Pods/SquareBuyerVerificationSDK/XCFrameworks/SquareBuyerVerificationSDK.xcframework/ios-arm64/SquareBuyerVerificationSDK.framework/ThreeDS_SDK.framework'
};

// Destination paths (top-level Frameworks directory in Pods)
const destPaths = {
  corePaymentCard: './ios/Pods/SquareInAppPaymentsSDK/XCFrameworks/SquareInAppPaymentsSDK.xcframework/ios-arm64/CorePaymentCard.framework',
  threeDS: './ios/Pods/SquareBuyerVerificationSDK/XCFrameworks/SquareBuyerVerificationSDK.xcframework/ios-arm64/ThreeDS_SDK.framework'
};

// Move CorePaymentCard.framework to top level
if (fs.existsSync(sourcePaths.corePaymentCard)) {
  console.log('\n📦 Moving CorePaymentCard.framework to top level...');
  
  // Ensure destination doesn't exist
  if (fs.existsSync(destPaths.corePaymentCard)) {
    fs.rmSync(destPaths.corePaymentCard, { recursive: true, force: true });
  }
  
  // Move it
  fs.renameSync(sourcePaths.corePaymentCard, destPaths.corePaymentCard);
  console.log('✅ Moved CorePaymentCard.framework to top level');
  
  // Delete the now-empty parent Frameworks folder if it exists
  const parentFrameworksDir = path.dirname(sourcePaths.corePaymentCard);
  if (fs.existsSync(parentFrameworksDir) && fs.readdirSync(parentFrameworksDir).length === 0) {
    fs.rmdirSync(parentFrameworksDir);
    console.log('✅ Removed empty Frameworks folder');
  }
}

// Move ThreeDS_SDK.framework to top level
if (fs.existsSync(sourcePaths.threeDS)) {
  console.log('\n📦 Moving ThreeDS_SDK.framework to top level...');
  
  if (fs.existsSync(destPaths.threeDS)) {
    fs.rmSync(destPaths.threeDS, { recursive: true, force: true });
  }
  
  fs.renameSync(sourcePaths.threeDS, destPaths.threeDS);
  console.log('✅ Moved ThreeDS_SDK.framework to top level');
  
  const parentFrameworksDir = path.dirname(sourcePaths.threeDS);
  if (fs.existsSync(parentFrameworksDir) && fs.readdirSync(parentFrameworksDir).length === 0) {
    fs.rmdirSync(parentFrameworksDir);
    console.log('✅ Removed empty Frameworks folder');
  }
}

// Also need to update any plist or reference files to reflect new paths
console.log('\n📝 Updating framework references...');

// Final structure verification
console.log('\n🔍 Final structure:');
const frameworksDir = './ios/Pods/SquareInAppPaymentsSDK/XCFrameworks/SquareInAppPaymentsSDK.xcframework/ios-arm64/';
if (fs.existsSync(frameworksDir)) {
  const contents = fs.readdirSync(frameworksDir);
  console.log('📋 ios-arm64 contents:', contents);
}

console.log('\n🎉 [SQUARE-PATCH] SCRIPT COMPLETE');