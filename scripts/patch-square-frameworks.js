// scripts/patch-square-frameworks.js
const fs = require('fs');
const path = require('path');

console.log('\n🚀 ==========================================');
console.log('🚀 SQUARE FRAMEWORK PATCHER STARTING');
console.log('🚀 ==========================================');
console.log(`📅 Timestamp: ${new Date().toISOString()}`);
console.log(`📂 Current working directory: ${process.cwd()}`);
console.log(`👤 Running as user: ${process.env.USER || 'unknown'}`);
console.log('');

// Check if we're in EAS Build
if (process.env.EAS_BUILD) {
  console.log('🏗️  Running in EAS Build environment');
  console.log(`   EAS Build ID: ${process.env.EAS_BUILD_ID || 'unknown'}`);
  console.log(`   EAS Build Profile: ${process.env.EAS_BUILD_PROFILE || 'unknown'}`);
} else {
  console.log('💻 Running locally (not in EAS)');
}

// Check all possible locations where frameworks might be
const locationsToCheck = [
  {
    name: 'Pods XCFrameworks (iOS arm64)',
    path: './ios/Pods/SquareInAppPaymentsSDK/XCFrameworks/SquareInAppPaymentsSDK.xcframework/ios-arm64/SquareInAppPaymentsSDK.framework',
    exists: false
  },
  {
    name: 'Pods XCFrameworks (simulator)',
    path: './ios/Pods/SquareInAppPaymentsSDK/XCFrameworks/SquareInAppPaymentsSDK.xcframework/ios-arm64_x86_64-simulator/SquareInAppPaymentsSDK.framework',
    exists: false
  },
  {
    name: 'Pods direct (old structure)',
    path: './ios/Pods/SquareInAppPaymentsSDK/SquareInAppPaymentsSDK.framework',
    exists: false
  },
  {
    name: 'node_modules (source)',
    path: './node_modules/react-native-square-in-app-payments/ios/Frameworks/SquareInAppPaymentsSDK.framework',
    exists: false
  }
];

console.log('\n🔍 Checking all possible framework locations:');
locationsToCheck.forEach(loc => {
  const fullPath = path.resolve(loc.path);
  const exists = fs.existsSync(fullPath);
  loc.exists = exists;
  console.log(`   ${exists ? '✅' : '❌'} ${loc.name}: ${loc.path}`);
  if (exists) {
    // Show what's inside
    try {
      const contents = fs.readdirSync(fullPath);
      console.log(`      Contents: ${contents.join(', ')}`);
      
      // Specifically check for problematic files
      if (contents.includes('setup')) console.log(`      ⚠️  Found setup script!`);
      if (contents.includes('Frameworks')) console.log(`      ⚠️  Found nested Frameworks folder!`);
    } catch (e) {
      console.log(`      Error reading contents: ${e.message}`);
    }
  }
});

// Patch the frameworks where they exist
let patchedCount = 0;
locationsToCheck.forEach(loc => {
  if (loc.exists) {
    console.log(`\n🔧 Patching ${loc.name}...`);
    const fullPath = path.resolve(loc.path);
    
    try {
      // Delete setup script
      const setupScript = path.join(fullPath, 'setup');
      if (fs.existsSync(setupScript)) {
        fs.unlinkSync(setupScript);
        console.log(`   ✅ Deleted setup script`);
        patchedCount++;
      }
      
      // Handle nested Frameworks folder
      const nestedFrameworksPath = path.join(fullPath, 'Frameworks');
      const corePaymentCardPath = path.join(nestedFrameworksPath, 'CorePaymentCard.framework');
      const destinationPath = path.join(fullPath, 'CorePaymentCard.framework');
      
      if (fs.existsSync(corePaymentCardPath)) {
        console.log(`   Found CorePaymentCard.framework in nested folder`);
        
        // Move CorePaymentCard up
        if (fs.existsSync(destinationPath)) {
          fs.rmSync(destinationPath, { recursive: true, force: true });
        }
        fs.renameSync(corePaymentCardPath, destinationPath);
        console.log(`   ✅ Moved CorePaymentCard.framework to parent`);
        patchedCount++;
        
        // Remove empty Frameworks folder
        if (fs.existsSync(nestedFrameworksPath)) {
          const remaining = fs.readdirSync(nestedFrameworksPath);
          if (remaining.length === 0) {
            fs.rmdirSync(nestedFrameworksPath);
            console.log(`   ✅ Removed empty Frameworks folder`);
            patchedCount++;
          } else {
            console.log(`   ⚠️  Nested folder not empty: ${remaining.join(', ')}`);
          }
        }
      }
      
      // Also check for any .sh files
      const files = fs.readdirSync(fullPath);
      files.forEach(file => {
        if (file.endsWith('.sh') && file !== 'setup') {
          fs.unlinkSync(path.join(fullPath, file));
          console.log(`   ✅ Deleted extra script: ${file}`);
          patchedCount++;
        }
      });
      
    } catch (error) {
      console.log(`   ❌ Error patching: ${error.message}`);
    }
  }
});

// Final verification
console.log('\n🔍 Final verification:');
locationsToCheck.forEach(loc => {
  if (loc.exists) {
    const fullPath = path.resolve(loc.path);
    try {
      const contents = fs.readdirSync(fullPath);
      if (contents.includes('setup')) {
        console.log(`   ❌ ${loc.name} STILL HAS setup script!`);
      } else if (contents.includes('Frameworks')) {
        console.log(`   ❌ ${loc.name} STILL HAS nested Frameworks!`);
      } else {
        console.log(`   ✅ ${loc.name} is clean`);
      }
      
      // Verify CorePaymentCard is in right place
      if (contents.includes('CorePaymentCard.framework')) {
        console.log(`      ✅ CorePaymentCard.framework is in correct location`);
      }
    } catch (e) {
      // Ignore
    }
  }
});

console.log('\n📊 Summary:');
console.log(`   Total patches applied: ${patchedCount}`);
console.log(`   Timestamp: ${new Date().toISOString()}`);
console.log('\n🚀 ==========================================');
console.log('🚀 SQUARE FRAMEWORK PATCHER COMPLETE');
console.log('🚀 ==========================================\n');