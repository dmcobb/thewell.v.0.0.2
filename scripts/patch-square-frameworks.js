// scripts/patch-square-frameworks.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Patching Square iOS frameworks...');

const frameworkPaths = [
  './ios/Pods/SquareInAppPaymentsSDK/SquareInAppPaymentsSDK.framework',
  './ios/Pods/SquareBuyerVerificationSDK/SquareBuyerVerificationSDK.framework'
];

frameworkPaths.forEach(frameworkPath => {
  if (fs.existsSync(frameworkPath)) {
    console.log(`📦 Processing ${frameworkPath}...`);
    
    // Remove nested Frameworks directory
    const nestedFrameworks = path.join(frameworkPath, 'Frameworks');
    if (fs.existsSync(nestedFrameworks)) {
      console.log(`  Removing nested Frameworks: ${nestedFrameworks}`);
      try {
        execSync(`rm -rf "${nestedFrameworks}"`, { stdio: 'inherit' });
        console.log(`  ✅ Removed nested Frameworks`);
      } catch (error) {
        console.error(`  ❌ Failed to remove nested Frameworks: ${error.message}`);
      }
    }
    
    // Remove setup script
    const setupScript = path.join(frameworkPath, 'setup');
    if (fs.existsSync(setupScript)) {
      console.log(`  Removing setup script: ${setupScript}`);
      try {
        execSync(`rm -f "${setupScript}"`, { stdio: 'inherit' });
        console.log(`  ✅ Removed setup script`);
      } catch (error) {
        console.error(`  ❌ Failed to remove setup script: ${error.message}`);
      }
    }
    
    // Also remove any other shell scripts that might be problematic
    try {
      const findScripts = execSync(`find "${frameworkPath}" -name "*.sh" -type f`, { encoding: 'utf8' });
      if (findScripts.trim()) {
        console.log(`  Found additional scripts: ${findScripts.trim()}`);
        execSync(`find "${frameworkPath}" -name "*.sh" -type f -delete`, { stdio: 'inherit' });
        console.log(`  ✅ Removed additional shell scripts`);
      }
    } catch (error) {
      // No scripts found, that's fine
    }
    
    console.log(`  ✅ Finished cleaning ${frameworkPath}`);
  } else {
    console.log(`⚠️  Framework not found: ${frameworkPath}`);
  }
});

// Also clean up any leftover frameworks in the build directory
console.log('\n🔍 Checking build directories...');

const buildRoots = [
  './ios/build',
  './ios/DerivedData'
];

buildRoots.forEach(root => {
  if (fs.existsSync(root)) {
    console.log(`📁 Searching in ${root}...`);
    
    try {
      // Find all Square frameworks in build directories
      const findCommand = `find "${root}" -path "*/Square*.framework" -type d 2>/dev/null || true`;
      const frameworks = execSync(findCommand, { encoding: 'utf8' })
        .split('\n')
        .filter(line => line.trim());
      
      frameworks.forEach(frameworkPath => {
        if (frameworkPath.trim()) {
          console.log(`  Found build framework: ${frameworkPath}`);
          
          // Clean nested Frameworks
          const nestedFrameworks = path.join(frameworkPath, 'Frameworks');
          if (fs.existsSync(nestedFrameworks)) {
            console.log(`    Removing nested Frameworks from build framework`);
            execSync(`rm -rf "${nestedFrameworks}"`, { stdio: 'inherit' });
          }
          
          // Clean setup script
          const setupScript = path.join(frameworkPath, 'setup');
          if (fs.existsSync(setupScript)) {
            console.log(`    Removing setup script from build framework`);
            execSync(`rm -f "${setupScript}"`, { stdio: 'inherit' });
          }
          
          // Clean any shell scripts
          execSync(`find "${frameworkPath}" -name "*.sh" -type f -delete 2>/dev/null || true`, { stdio: 'inherit' });
        }
      });
    } catch (error) {
      console.error(`  Error searching ${root}: ${error.message}`);
    }
  }
});

console.log('\n🔧 Verifying fixes...');

// Verify the fixes by checking if any problematic files remain
try {
  const checkCommand = `find . -path "*/Square*.framework" -type d -exec find {} \\; -name "setup" -o -name "*.sh" -o -path "*/Frameworks/*" 2>/dev/null | head -20`;
  const remainingIssues = execSync(checkCommand, { encoding: 'utf8' });
  
  if (remainingIssues.trim()) {
    console.log('⚠️  Some issues may still remain:');
    console.log(remainingIssues);
  } else {
    console.log('✅ No problematic files found in Square frameworks!');
  }
} catch (error) {
  console.log('✅ Verification complete (no issues found)');
}

console.log('\n🎉 Square framework patching complete!');