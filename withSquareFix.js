const { withXcodeProject } = require('expo/config-plugins');

const withSquareFix = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const targetUuid = xcodeProject.getFirstTarget().uuid;

    const scriptName = 'SQUARE_CLEANUP_FINAL';
        const shellScript = `
echo "🚀 [SQUARE_FIX] Starting cleanup and re-signing..."

# Define potential paths for the app bundle
# Archive builds often use different environment variables than standard builds
if [ -d "\${INSTALL_PATH}/\${CONTENTS_FOLDER_PATH}/Frameworks" ]; then
    FRAMEWORKS="\${INSTALL_PATH}/\${CONTENTS_FOLDER_PATH}/Frameworks"
elif [ -d "\${BUILT_PRODUCTS_DIR}/\${FRAMEWORKS_FOLDER_PATH}" ]; then
    FRAMEWORKS="\${BUILT_PRODUCTS_DIR}/\${FRAMEWORKS_FOLDER_PATH}"
else
    # Fallback: Search the immediate build directory for the .app folder
    FRAMEWORKS=$(find "\${DERIVED_FILE_DIR}/.." -name "*.app" -type d -finddepth 1)/Frameworks
fi

echo "📂 [SQUARE_FIX] Checking path: \${FRAMEWORKS}"

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
  echo "❌ [SQUARE_FIX] Error: Square frameworks not found. Current directory content:"
  ls -R "\${FRAMEWORKS%/*}" | grep ".framework" || echo "No frameworks found at all."
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
