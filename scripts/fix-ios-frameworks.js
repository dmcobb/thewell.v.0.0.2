// scripts/fix-ios-frameworks.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing iOS framework linking...');

const projectRoot = path.join(__dirname, '..');

try {
  // Look for the built app in the standard Expo build location
  const possiblePaths = [
    path.join(projectRoot, 'ios/build/Build/Products/Release-iphonesimulator'),
    path.join(projectRoot, 'ios/build/Build/Products/Debug-iphonesimulator'),
    path.join(projectRoot, 'ios/build'),
  ];

  let appPath = null;
  for (const basePath of possiblePaths) {
    if (fs.existsSync(basePath)) {
      try {
        const findApp = execSync(`find "${basePath}" -name "*.app" -type d | head -1`, { encoding: 'utf8' }).trim();
        if (findApp) {
          appPath = findApp;
          break;
        }
      } catch (e) {
        // Continue searching
      }
    }
  }

  if (!appPath) {
    console.log('⚠️ No .app bundle found');
    return;
  }

  console.log(`📱 Found app bundle: ${appPath}`);

  const frameworksPath = path.join(appPath, 'Frameworks');
  
  // Create Frameworks directory if it doesn't exist
  if (!fs.existsSync(frameworksPath)) {
    fs.mkdirSync(frameworksPath, { recursive: true });
  }

  // Look for CorePaymentCard in Pods
  const podsPath = path.join(projectRoot, 'ios/Pods');
  const corePaymentCardSource = path.join(podsPath, 'CorePaymentCard', 'CorePaymentCard.framework');

  if (fs.existsSync(corePaymentCardSource)) {
    console.log('✅ Found CorePaymentCard.framework in Pods');
    
    const corePaymentCardDest = path.join(frameworksPath, 'CorePaymentCard.framework');
    
    // Copy framework if not already there
    if (!fs.existsSync(corePaymentCardDest)) {
      console.log('📋 Copying CorePaymentCard.framework to app bundle...');
      execSync(`cp -R "${corePaymentCardSource}" "${corePaymentCardDest}"`);
      
      // On macOS/Linux (including Windows WSL), we can't use codesign, so skip for simulator builds
      console.log('✅ CorePaymentCard.framework copied successfully');
    }
  } else {
    console.log('⚠️ CorePaymentCard.framework not found in Pods');
    
    // Try to find it elsewhere
    try {
      const findFramework = execSync(`find "${podsPath}" -name "CorePaymentCard.framework" -type d | head -1`, { encoding: 'utf8' }).trim();
      if (findFramework) {
        console.log(`Found CorePaymentCard.framework at: ${findFramework}`);
      } else {
        console.log('❌ CorePaymentCard.framework not found anywhere');
      }
    } catch (e) {
      console.log('❌ Could not find CorePaymentCard.framework');
    }
  }

  console.log('✅ iOS framework check complete');
} catch (error) {
  console.error('❌ Error fixing iOS frameworks:', error.message);
}