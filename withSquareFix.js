const { withXcodeProject } = require('expo/config-plugins');

module.exports = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    
    // Find the "Embed Pods Frameworks" phase to insert our script after it
    const embedPhaseIndex = xcodeProject.hash.project.objects.PBXShellScriptBuildPhase 
      ? Object.values(xcodeProject.hash.project.objects.PBXShellScriptBuildPhase).findIndex(
          phase => phase.name === '[CP] Embed Pods Frameworks'
        )
      : -1;

    const scriptName = 'SQUARE_SDK_CLEANUP';
    
    const shellScript = `
echo "🔧 [SQUARE_FIX] Starting Square SDK cleanup..."

# The frameworks are copied from XCFrameworkIntermediates to the app's Frameworks
# during the Embed Pods Frameworks phase. We need to clean them AFTER they're copied.

APP_FRAMEWORKS_DIR="\${TARGET_BUILD_DIR}/\${FRAMEWORKS_FOLDER_PATH}"
XCFRAMEWORK_DIR="\${BUILT_PRODUCTS_DIR}/XCFrameworkIntermediates"

echo "📂 [SQUARE_FIX] App Frameworks: \$APP_FRAMEWORKS_DIR"
echo "📂 [SQUARE_FIX] XCFramework Intermediates: \$XCFRAMEWORK_DIR"

# Clean up the XCFramework intermediates first (to prevent copying problematic files)
if [ -d "\$XCFRAMEWORK_DIR/SquareInAppPaymentsSDK.framework" ]; then
    echo "✅ [SQUARE_FIX] Cleaning XCFramework intermediates..."
    
    # Remove nested Frameworks directories
    find "\$XCFRAMEWORK_DIR" -path "*/Square*.framework/Frameworks" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Remove setup script and other shell scripts
    find "\$XCFRAMEWORK_DIR" -path "*/Square*.framework/setup" -type f -delete 2>/dev/null || true
    find "\$XCFRAMEWORK_DIR" -path "*/Square*.framework/*.sh" -type f -delete 2>/dev/null || true
    find "\$XCFRAMEWORK_DIR" -path "*/Square*.framework/*.pl" -type f -delete 2>/dev/null || true
    
    echo "✅ [SQUARE_FIX] XCFramework intermediates cleaned"
fi

# Also clean the final app frameworks directory (in case files were already copied)
if [ -d "\$APP_FRAMEWORKS_DIR/SquareInAppPaymentsSDK.framework" ]; then
    echo "✅ [SQUARE_FIX] Cleaning final app frameworks..."
    
    find "\$APP_FRAMEWORKS_DIR" -path "*/Square*.framework/Frameworks" -type d -exec rm -rf {} + 2>/dev/null || true
    find "\$APP_FRAMEWORKS_DIR" -path "*/Square*.framework/setup" -type f -delete 2>/dev/null || true
    find "\$APP_FRAMEWORKS_DIR" -path "*/Square*.framework/*.sh" -type f -delete 2>/dev/null || true
    
    # Re-sign the frameworks after cleaning
    echo "✍️ [SQUARE_FIX] Re-signing Square frameworks..."
    for framework in "\$APP_FRAMEWORKS_DIR"/Square*.framework; do
        if [ -d "\$framework" ]; then
            /usr/bin/codesign --force --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements,flags --timestamp=none "\$framework"
        fi
    done
    
    echo "🎉 [SQUARE_FIX] Cleanup complete!"
else
    echo "⚠️ [SQUARE_FIX] Square frameworks not found in app frameworks yet"
fi

# List what's in the directories for debugging
echo "📋 [SQUARE_FIX] XCFramework contents:"
ls -la "\$XCFRAMEWORK_DIR"/Square*.framework/ 2>/dev/null || echo "No Square frameworks in XCFramework"

echo "📋 [SQUARE_FIX] App frameworks contents:"
ls -la "\$APP_FRAMEWORKS_DIR"/Square*.framework/ 2>/dev/null || echo "No Square frameworks in app"
    `;

    // Add the build phase
    const phase = xcodeProject.addBuildPhase(
      [],
      'PBXShellScriptBuildPhase',
      scriptName,
      xcodeProject.getFirstTarget().uuid,
      { 
        shellPath: '/bin/sh', 
        shellScript: shellScript,
        runOnlyForDeploymentPostprocessing: '1'
      }
    );

    // If we found the embed phase, move our script after it
    if (embedPhaseIndex !== -1) {
      const phases = xcodeProject.hash.project.objects.PBXShellScriptBuildPhase;
      const phaseKeys = Object.keys(phases);
      const ourPhaseKey = Object.keys(phases).find(
        key => phases[key].name === `"${scriptName}"`
      );
      
      if (ourPhaseKey && phaseKeys.length > embedPhaseIndex + 1) {
        // Move our phase to be right after the embed phase
        const temp = phases[phaseKeys[embedPhaseIndex + 1]];
        phases[phaseKeys[embedPhaseIndex + 1]] = phases[ourPhaseKey];
        phases[ourPhaseKey] = temp;
      }
    }

    return config;
  });
};