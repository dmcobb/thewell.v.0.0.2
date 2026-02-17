// scripts/fix-square-payments.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Square SDK and CorePaymentCard...');

// 1. Fix package.json exports (your original code)
const packagePath = path.join(__dirname, '../node_modules/react-native-square-in-app-payments/package.json');
try {
  const data = fs.readFileSync(packagePath, 'utf8');
  const pkg = JSON.parse(data);
  pkg.exports = {
    '.': {
      source: './src/index.ts',
      import: './src/index.ts',
      require: './src/index.ts',
      default: './src/index.ts',
    },
    './package.json': './package.json',
    './app.plugin.js': './app.plugin.js',
    './src/index.ts': './src/index.ts',
  };
  pkg.main = './src/index.ts';
  pkg.types = './src/index.ts';
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
  console.log('✅ Fixed package.json exports');
} catch (error) {
  console.error('❌ Error fixing package.json:', error.message);
}

// 2. Locate the built .app bundle
const iosBuildPath = path.join(__dirname, '../ios/build');
if (!fs.existsSync(iosBuildPath)) {
  console.log('⚠️ No iOS build folder found – skipping framework copy');
  process.exit(0);
}

let appBundlePath;
try {
  appBundlePath = execSync(`find "${iosBuildPath}" -name "*.app" -type d | head -1`, { encoding: 'utf8' }).trim();
} catch {
  console.log('⚠️ Could not find .app bundle');
  process.exit(0);
}

if (!appBundlePath) {
  console.log('⚠️ No .app bundle found');
  process.exit(0);
}

console.log(`📱 Found app bundle: ${appBundlePath}`);

const frameworksDir = path.join(appBundlePath, 'Frameworks');
if (!fs.existsSync(frameworksDir)) {
  fs.mkdirSync(frameworksDir, { recursive: true });
}

// 3. Look for CorePaymentCard.framework in Pods
const podsDir = path.join(__dirname, '../ios/Pods');
const corePaymentCardSource = path.join(podsDir, 'CorePaymentCard', 'CorePaymentCard.framework');

if (fs.existsSync(corePaymentCardSource)) {
  const corePaymentCardDest = path.join(frameworksDir, 'CorePaymentCard.framework');

  // Remove existing if any
  if (fs.existsSync(corePaymentCardDest)) {
    execSync(`rm -rf "${corePaymentCardDest}"`);
  }

  console.log('📋 Copying CorePaymentCard.framework to app bundle...');
  execSync(`cp -R "${corePaymentCardSource}" "${corePaymentCardDest}"`);

  // Fix the framework’s internal install name
  const frameworkBinary = path.join(corePaymentCardDest, 'CorePaymentCard');
  if (fs.existsSync(frameworkBinary)) {
    execSync(`install_name_tool -id @rpath/CorePaymentCard.framework/CorePaymentCard "${frameworkBinary}"`);
    console.log('🔧 Updated CorePaymentCard binary install name');
  }

  // **Sign the framework** (required for device)
  try {
    execSync(`codesign --force --sign - "${corePaymentCardDest}"`);
    console.log('✅ Signed CorePaymentCard.framework');
  } catch (signError) {
    console.log('⚠️ Could not sign CorePaymentCard (may be fine for simulator)');
  }
} else {
  console.log('❌ CorePaymentCard.framework not found in Pods');
}

// 4. Also clean up Square frameworks (your existing code)
const cleanFramework = (name) => {
  const frameworkPath = path.join(frameworksDir, name);
  if (fs.existsSync(frameworkPath)) {
    console.log(`🔨 Cleaning ${name}...`);
    const nestedFrameworks = path.join(frameworkPath, 'Frameworks');
    if (fs.existsSync(nestedFrameworks)) {
      execSync(`rm -rf "${nestedFrameworks}"`);
    }
    const setupFile = path.join(frameworkPath, 'setup');
    if (fs.existsSync(setupFile)) {
      fs.unlinkSync(setupFile);
    }
  }
};

cleanFramework('SquareInAppPaymentsSDK.framework');
cleanFramework('SquareBuyerVerificationSDK.framework');

console.log('✅ All framework fixes applied');