const { withXcodeProject } = require('@expo/config-plugins');

module.exports = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const targetUuid = xcodeProject.getFirstTarget().uuid;

    // Use a unique name so we can find it in the logs easily
    const scriptName = 'FIX_SQUARE_SUBMISSION';
    const shellScript = `
echo "🚀 [SQUARE_FIX] Starting cleanup and re-signing..."
FRAMEWORKS="\${BUILT_PRODUCTS_DIR}/\${FRAMEWORKS_FOLDER_PATH}"

if [ -d "\${FRAMEWORKS}/SquareInAppPaymentsSDK.framework" ]; then
  # 1. Run the Square setup script
  "\${FRAMEWORKS}/SquareInAppPaymentsSDK.framework/setup"

  # 2. Delete disallowed files for App Store
  find "\${FRAMEWORKS}" -name "setup" -type f -delete
  find "\${FRAMEWORKS}" -name "Frameworks" -type d -exec rm -rf {} +

  # 3. Force re-sign for App Store submission
  /usr/bin/codesign --force --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements,flags --timestamp=none "\${FRAMEWORKS}/SquareInAppPaymentsSDK.framework"
  /usr/bin/codesign --force --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements,flags --timestamp=none "\${FRAMEWORKS}/SquareBuyerVerificationSDK.framework"
  /usr/bin/codesign --force --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements,flags --timestamp=none "\${FRAMEWORKS}/CorePaymentCard.framework"
  
  echo "✅ [SQUARE_FIX] Cleanup and Re-signing complete."
else
  echo "❌ [SQUARE_FIX] Error: Square frameworks not found in \${FRAMEWORKS}"
fi
    `;

    // Add the phase
    xcodeProject.addBuildPhase(
      [],
      'PBXShellScriptBuildPhase',
      scriptName,
      targetUuid,
      { shellPath: '/bin/sh', shellScript }
    );

    // CRITICAL: Manually move this phase to the absolute end of the array
    const target = xcodeProject.pbxTargetByName(xcodeProject.getFirstTarget().target.name);
    const phases = target.buildPhases;
    const ourPhaseIndex = phases.findIndex(p => p.comment === scriptName);
    if (ourPhaseIndex > -1) {
      const ourPhase = phases.splice(ourPhaseIndex, 1)[0];
      phases.push(ourPhase); // Put it at the very end
    }

    return config;
  });
};
