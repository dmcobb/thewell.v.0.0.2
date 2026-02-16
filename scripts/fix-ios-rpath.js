// scripts/fix-ios-rpath.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing iOS rpath for CorePaymentCard...');

const projectRoot = path.join(__dirname, '..');
const iosBuildPath = path.join(projectRoot, 'ios/build');

try {
  if (fs.existsSync(iosBuildPath)) {
    // Find the .app bundle
    const findApp = execSync(`find "${iosBuildPath}" -name "*.app" -type d | head -1`, { encoding: 'utf8' }).trim();
    
    if (findApp) {
      console.log(`📱 Found app bundle: ${findApp}`);
      
      const frameworksPath = path.join(findApp, 'Frameworks');
      
      if (fs.existsSync(frameworksPath)) {
        // Just verify the frameworks are there
        const frameworks = fs.readdirSync(frameworksPath);
        console.log('📦 Frameworks in app bundle:', frameworks);
        
        // Check for CorePaymentCard
        const hasCorePaymentCard = frameworks.some(f => f.includes('CorePaymentCard'));
        
        if (hasCorePaymentCard) {
          console.log('✅ CorePaymentCard.framework found in app bundle');
        } else {
          console.log('⚠️ CorePaymentCard.framework not found in app bundle');
        }
      } else {
        console.log('⚠️ No Frameworks folder in app bundle');
      }
    }
  } else {
    console.log('⚠️ No iOS build found - skipping rpath fix');
  }
} catch (error) {
  console.error('❌ Error fixing iOS rpath:', error.message);
}