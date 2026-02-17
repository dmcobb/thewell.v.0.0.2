const { withXcodeProject } = require('@expo/config-plugins');

const withSquareFix = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const targetUuid = xcodeProject.getFirstTarget().uuid;

    const scriptName = 'SQUARE_CLEANUP_FINAL';
    const shellScript = `
echo "🚀 [SQUARE_FIX] Starting cleanup and re-signing..."
FRAMEWORKS="\${BUILT_PRODUCTS_DIR}/\${FRAMEWORKS_FOLDER_PATH}"

if [ -d "\${FRAMEWORKS}/SquareInAppPaymentsSDK.framework" ]; then
  # 1. Run Square setup
  "\${FRAMEWORKS}/SquareInAppPaymentsSDK.framework/setup"

  # 2. Delete disallowed files
  echo "🧹 Cleaning disallowed files..."
  find "\${FRAMEWORKS}" -name "setup" -type f -delete
  find "\${FRAMEWORKS}" -name "Frameworks" -type d -exec rm -rf {} +

  # 3. Re-sign
  echo "✍️ Re-signing for App Store..."
  /usr/bin/codesign --force --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements,flags --timestamp=none "\${FRAMEWORKS}/SquareInAppPaymentsSDK.framework"
  /usr/bin/codesign --force --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements,flags --timestamp=none "\${FRAMEWORKS}/SquareBuyerVerificationSDK.framework"
  /usr/bin/codesign --force --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements,flags --timestamp=none "\${FRAMEWORKS}/CorePaymentCard.framework"
  
  echo "✅ [SQUARE_FIX] Completed successfully."
else
  echo "❌ [SQUARE_FIX] Error: Frameworks NOT FOUND in \${FRAMEWORKS}"
fi
    `;

    // Remove existing phase if it exists (prevents duplicates)
    const phases = xcodeProject.hash.project.objects.PBXShellScriptBuildPhase;
    for (const key in phases) {
      if (phases[key].name === `"${scriptName}"`) {
        delete phases[key];
      }
    }

    // Add the phase at the absolute end
    xcodeProject.addBuildPhase(
      [],
      'PBXShellScriptBuildPhase',
      scriptName,
      targetUuid,
      { shellPath: '/bin/sh', shellScript }
    );

    return config;
  });
};

module.exports = withSquareFix;
