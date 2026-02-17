const { withProjectBuildVars, withXcodeProject } = require('expo/config-plugins');

module.exports = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const targetUuid = xcodeProject.getFirstTarget().uuid;

    // Use a name that shows up clearly in logs
    const scriptName = 'SQUARE_FINAL_FIX_PRODUCTION';
    
    // This script is more aggressive at finding the bundle in the Archive
    const shellScript = `
echo "🚀 [SQUARE_FIX] Searching for frameworks..."

# Find the app bundle anywhere in the build artifacts
APP_BUNDLE=$(find "\${OBJROOT}/ArchiveIntermediates" -name "*.app" -type d | head -1)

if [ -z "$APP_BUNDLE" ]; then
    APP_BUNDLE="\${CONFIGURATION_BUILD_DIR}/\${CONTENTS_FOLDER_PATH}"
fi

FRAMEWORKS_DIR="$APP_BUNDLE/Frameworks"
echo "📂 [SQUARE_FIX] Target: $FRAMEWORKS_DIR"

if [ -d "$FRAMEWORKS_DIR/SquareInAppPaymentsSDK.framework" ]; then
    echo "✅ [SQUARE_FIX] Found Square SDK. Starting fix..."
    
    # 1. Run Setup
    "$FRAMEWORKS_DIR/SquareInAppPaymentsSDK.framework/setup"
    
    # 2. Cleanup disallowed files
    find "$FRAMEWORKS_DIR" -name "setup" -type f -delete
    find "$FRAMEWORKS_DIR" -name "Frameworks" -type d -exec rm -rf {} +
    
    # 3. Re-sign everything in the Frameworks folder
    echo "✍️ [SQUARE_FIX] Re-signing..."
    for i in "$FRAMEWORKS_DIR"/*.framework; do
        /usr/bin/codesign --force --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements,flags --timestamp=none "$i"
    done
    echo "🎉 [SQUARE_FIX] Done!"
else
    echo "❌ [SQUARE_FIX] Square frameworks still not found in $FRAMEWORKS_DIR"
    echo "Checking Archive root:"
    find "\${OBJROOT}/ArchiveIntermediates" -name "*.framework" -type d | head -n 5
fi
    `;

    // Add as a Shell Script Build Phase
    xcodeProject.addBuildPhase(
      [],
      'PBXShellScriptBuildPhase',
      scriptName,
      targetUuid,
      { 
        shellPath: '/bin/sh', 
        shellScript: shellScript,
        runOnlyForDeploymentPostprocessing: '1' // CRITICAL: Only runs during Archive/Production
      }
    );

    return config;
  });
};
