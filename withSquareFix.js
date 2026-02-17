// withSquareFix.js
const { withXcodeProject } = require('@expo/config-plugins');

module.exports = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const targetUuid = xcodeProject.getFirstTarget().uuid;

    // This script fixes the DYLD error, cleans disallowed files, and re-signs for Apple
    const squareSetupScript = `
FRAMEWORKS="\${BUILT_PRODUCTS_DIR}/\${FRAMEWORKS_FOLDER_PATH}"

if [ -d "\${FRAMEWORKS}/SquareInAppPaymentsSDK.framework" ]; then
  echo "🔧 Running Square Setup Script..."
  "\${FRAMEWORKS}/SquareInAppPaymentsSDK.framework/setup"

  echo "🧹 Cleaning disallowed files for App Store submission..."
  # Remove the 'setup' script and nested 'Frameworks' folders that cause App Store rejection
  find "\${FRAMEWORKS}" -name "setup" -type f -delete
  find "\${FRAMEWORKS}" -name "Frameworks" -type d -exec rm -rf {} +

  echo "✍️ Re-signing frameworks..."
  # Re-sign the frameworks using the same identity as the app to fix the 'Invalid Signature' error
  /usr/bin/codesign --force --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements,flags --timestamp=none "\${FRAMEWORKS}/SquareInAppPaymentsSDK.framework"
  /usr/bin/codesign --force --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements,flags --timestamp=none "\${FRAMEWORKS}/SquareBuyerVerificationSDK.framework"
  /usr/bin/codesign --force --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements,flags --timestamp=none "\${FRAMEWORKS}/CorePaymentCard.framework"
else
  echo "⚠️ Square framework not found, skipping."
fi
    `;

    xcodeProject.addBuildPhase(
      [],
      'PBXShellScriptBuildPhase',
      'Fix Square DYLD and Cleanup',
      targetUuid,
      {
        shellPath: '/bin/sh',
        shellScript: squareSetupScript,
      }
    );

    return config;
  });
};
