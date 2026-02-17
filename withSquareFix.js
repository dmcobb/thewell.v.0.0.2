const { withXcodeProject } = require('expo/config-plugins');

module.exports = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const targetUuid = xcodeProject.getFirstTarget().uuid;

    // Use a name that shows up clearly in logs
    const scriptName = 'SQUARE_SDK_CLEANUP';
    
    // This script runs earlier and does more thorough cleanup
    const shellScript = `
echo "🔧 [SQUARE_FIX] Starting Square SDK cleanup..."

# Use CONFIGURATION_BUILD_DIR which is more reliable for archives
FRAMEWORKS_DIR="\${CONFIGURATION_BUILD_DIR}/\${CONTENTS_FOLDER_PATH}/Frameworks"
echo "📂 [SQUARE_FIX] Target: \$FRAMEWORKS_DIR"

if [ -d "\$FRAMEWORKS_DIR/SquareInAppPaymentsSDK.framework" ]; then
    echo "✅ [SQUARE_FIX] Found Square SDK. Cleaning up..."
    
    # Remove the nested Frameworks directories inside each Square framework
    find "\$FRAMEWORKS_DIR" -path "*/Square*.framework/Frameworks" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Remove the setup script specifically
    find "\$FRAMEWORKS_DIR" -path "*/Square*.framework/setup" -type f -delete 2>/dev/null || true
    
    # Also remove any other disallowed files
    find "\$FRAMEWORKS_DIR" -path "*/Square*.framework/*.sh" -type f -delete 2>/dev/null || true
    find "\$FRAMEWORKS_DIR" -path "*/Square*.framework/*.pl" -type f -delete 2>/dev/null || true
    
    echo "🎉 [SQUARE_FIX] Cleanup complete!"
    
    # List what's left for debugging
    echo "📋 [SQUARE_FIX] Remaining Square framework contents:"
    ls -la "\$FRAMEWORKS_DIR"/Square*.framework/ 2>/dev/null || echo "No Square frameworks found"
else
    echo "❌ [SQUARE_FIX] Square frameworks not found at \$FRAMEWORKS_DIR"
    echo "🔍 [SQUARE_FIX] Searching in build dir: \${CONFIGURATION_BUILD_DIR}"
    find "\${CONFIGURATION_BUILD_DIR}" -name "Square*.framework" -type d 2>/dev/null || echo "No Square frameworks found anywhere"
fi
    `;

    // Add as a Shell Script Build Phase that runs BEFORE embed frameworks
    // and ONLY during archive/production
    xcodeProject.addBuildPhase(
      [],
      'PBXShellScriptBuildPhase',
      scriptName,
      targetUuid,
      { 
        shellPath: '/bin/sh', 
        shellScript: shellScript,
        runOnlyForDeploymentPostprocessing: '1', // Only runs during Archive
        // Add this to ensure it runs early
        buildActionMask: '8' // This puts it in the "Pre-actions" category
      }
    );

    return config;
  });
};