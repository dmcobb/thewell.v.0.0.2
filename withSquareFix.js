// withSquareFix.js
const { withXcodeProject } = require('@expo/config-plugins');

module.exports = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const targetUuid = xcodeProject.getFirstTarget().uuid;

    const squareSetupScript = `
FRAMEWORKS="\${BUILT_PRODUCTS_DIR}/\${FRAMEWORKS_FOLDER_PATH}"

if [ -d "\${FRAMEWORKS}/SquareInAppPaymentsSDK.framework" ]; then
  echo "🔧 Final Square Fix & Cleanup starting..."
  
  # 1. Run the Square setup to link CorePaymentCard
  "\${FRAMEWORKS}/SquareInAppPaymentsSDK.framework/setup"

  # 2. Delete the disallowed 'setup' files and nested 'Frameworks' folders
  echo "🧹 Removing disallowed files from bundle..."
  find "\${FRAMEWORKS}" -name "setup" -type f -delete
  find "\${FRAMEWORKS}" -name "Frameworks" -type d -exec rm -rf {} +

  # 3. Force re-sign everything with the Distribution Identity
  echo "✍️ Re-signing Square frameworks..."
  /usr/bin/codesign --force --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements,flags --timestamp=none "\${FRAMEWORKS}/SquareInAppPaymentsSDK.framework"
  /usr/bin/codesign --force --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements,flags --timestamp=none "\${FRAMEWORKS}/SquareBuyerVerificationSDK.framework"
  /usr/bin/codesign --force --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements,flags --timestamp=none "\${FRAMEWORKS}/CorePaymentCard.framework"
  
  echo "✅ Square fix complete."
else
  echo "⚠️ Square framework not found in \${FRAMEWORKS}, check paths."
fi
    `;

    // We add the phase at the END of the build process
    xcodeProject.addBuildPhase(
      [],
      'PBXShellScriptBuildPhase',
      'Fix Square DYLD and Cleanup',
      targetUuid,
      {
        shellPath: '/bin/sh',
        shellScript: squareSetupScript,
        shellScriptLoc: 'end' // <--- CRITICAL: Runs after 'Embed Pods Frameworks'
      }
    );

    return config;
  });
};
