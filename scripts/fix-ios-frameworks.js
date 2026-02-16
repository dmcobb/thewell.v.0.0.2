// scripts/fix-ios-frameworks.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing iOS framework linking...');

const projectRoot = path.join(__dirname, '..');
const iosBuildPath = path.join(projectRoot, 'ios/build');
const podsPath = path.join(projectRoot, 'ios/Pods');

try {
  // Find the built app
  const findApp = execSync(`find "${iosBuildPath}" -name "*.app" -type d | head -1`, { encoding: 'utf8' }).trim();
  
  if (findApp) {
    console.log(`📱 Found app bundle: ${findApp}`);
    
    const frameworksPath = path.join(findApp, 'Frameworks');
    
    // Create Frameworks directory if it doesn't exist
    if (!fs.existsSync(frameworksPath)) {
      fs.mkdirSync(frameworksPath, { recursive: true });
    }
    
    // Look for CorePaymentCard in Pods
    const corePaymentCardSource = path.join(podsPath, 'CorePaymentCard', 'CorePaymentCard.framework');
    
    if (fs.existsSync(corePaymentCardSource)) {
      console.log('✅ Found CorePaymentCard.framework in Pods');
      
      const corePaymentCardDest = path.join(frameworksPath, 'CorePaymentCard.framework');
      
      // Copy framework if not already there
      if (!fs.existsSync(corePaymentCardDest)) {
        console.log('📋 Copying CorePaymentCard.framework to app bundle...');
        execSync(`cp -R "${corePaymentCardSource}" "${corePaymentCardDest}"`);
        
        // Fix the framework binary's install name
        const frameworkBinary = path.join(corePaymentCardDest, 'CorePaymentCard');
        if (fs.existsSync(frameworkBinary)) {
          console.log('🔧 Fixing CorePaymentCard binary paths...');
          
          // Check current paths
          const otool = execSync(`otool -L "${frameworkBinary}"`, { encoding: 'utf8' });
          console.log('Current paths:', otool);
          
          // Change the ID to @rpath
          execSync(`install_name_tool -id @rpath/CorePaymentCard.framework/CorePaymentCard "${frameworkBinary}"`);
          
          // Sign the framework (required for device)
          try {
            execSync(`codesign --force --sign - "${corePaymentCardDest}"`);
            console.log('✅ Signed CorePaymentCard.framework');
          } catch (signError) {
            console.log('⚠️ Could not sign framework (may be fine for simulator):', signError.message);
          }
        }
      }
      
      // Also ensure Square frameworks are properly linked
      const squareIAPSource = path.join(podsPath, 'SquareInAppPaymentsSDK', 'SquareInAppPaymentsSDK.framework');
      const squareIAPDest = path.join(frameworksPath, 'SquareInAppPaymentsSDK.framework');
      
      if (fs.existsSync(squareIAPSource) && !fs.existsSync(squareIAPDest)) {
        console.log('📋 Copying SquareInAppPaymentsSDK.framework...');
        execSync(`cp -R "${squareIAPSource}" "${squareIAPDest}"`);
      }
      
      const squareBVSource = path.join(podsPath, 'SquareBuyerVerificationSDK', 'SquareBuyerVerificationSDK.framework');
      const squareBVDest = path.join(frameworksPath, 'SquareBuyerVerificationSDK.framework');
      
      if (fs.existsSync(squareBVSource) && !fs.existsSync(squareBVDest)) {
        console.log('📋 Copying SquareBuyerVerificationSDK.framework...');
        execSync(`cp -R "${squareBVSource}" "${squareBVDest}"`);
      }
      
      console.log('✅ iOS frameworks fixed!');
    } else {
      console.log('❌ CorePaymentCard.framework not found in Pods');
      console.log('Searching for CorePaymentCard...');
      
      // Search for CorePaymentCard anywhere in Pods
      const findFramework = execSync(`find "${podsPath}" -name "CorePaymentCard.framework" -type d`, { encoding: 'utf8' }).trim();
      if (findFramework) {
        console.log(`Found at: ${findFramework}`);
      }
    }
  } else {
    console.log('⚠️ No .app bundle found in iOS build');
  }
} catch (error) {
  console.error('❌ Error fixing iOS frameworks:', error.message);
}