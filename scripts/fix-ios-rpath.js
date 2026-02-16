// scripts/fix-ios-rpath.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing iOS rpath for CorePaymentCard...');

const iosBuildPath = path.join(__dirname, '../ios/build');

try {
  if (fs.existsSync(iosBuildPath)) {
    // Find the .app bundle
    const findApp = execSync(`find "${iosBuildPath}" -name "*.app" -type d | head -1`, { encoding: 'utf8' }).trim();
    
    if (findApp) {
      console.log(`📱 Found app bundle: ${findApp}`);
      
      // Check if CorePaymentCard framework exists
      const frameworksPath = path.join(findApp, 'Frameworks');
      if (fs.existsSync(frameworksPath)) {
        // List all frameworks to see what's actually there
        const frameworks = fs.readdirSync(frameworksPath);
        console.log('📦 Frameworks in app bundle:', frameworks);
        
        // Look for CorePaymentCard.framework
        const corePaymentCard = frameworks.find(f => f.includes('CorePaymentCard'));
        
        if (corePaymentCard) {
          console.log(`✅ Found ${corePaymentCard}`);
          
          // Use install_name_tool to fix rpath if needed
          const frameworkPath = path.join(frameworksPath, corePaymentCard, corePaymentCard.replace('.framework', ''));
          
          if (fs.existsSync(frameworkPath)) {
            try {
              // Check current rpath
              const otoolOutput = execSync(`otool -L "${frameworkPath}"`, { encoding: 'utf8' });
              console.log('📊 Framework dependencies:', otoolOutput);
              
              // You might need to use install_name_tool here to fix paths
              // This is complex and depends on what otool shows
              
            } catch (error) {
              console.log('⚠️  Could not inspect framework:', error.message);
            }
          }
        } else {
          console.log('⚠️  CorePaymentCard.framework not found in app bundle');
          
          // It might be in the Pods framework folder instead
          const podsFrameworkPath = path.join(__dirname, '../ios/Pods/../Pods/CorePaymentCard/CorePaymentCard.framework');
          if (fs.existsSync(podsFrameworkPath)) {
            console.log('📦 CorePaymentCard found in Pods folder, but not copied to app bundle');
          }
        }
      }
    }
  }
} catch (error) {
  console.error('❌ Error fixing iOS rpath:', error.message);
}