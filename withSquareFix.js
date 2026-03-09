const { withXcodeProject } = require('@expo/config-plugins');

module.exports = function withSquareFix(config) {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const buildPhaseName = 'Square Bundle Cleanup';
    
    const buildPhases = xcodeProject.hash.project.objects.PBXShellScriptBuildPhase;
    const alreadyExists = Object.values(buildPhases || {}).some(
      (phase) => phase.name === `"${buildPhaseName}"` || phase.name === buildPhaseName
    );

    if (!alreadyExists) {
      console.log(`🚀 [SQUARE-FIX] Adding Mandatory Apple Compliance Phase`);
      
      // This script runs AFTER the 'Embed Pods Frameworks' phase to catch the illegal files
      const script = `
        set -e
        FRAMEWORKS_DIR="\${TARGET_BUILD_DIR}/\${FRAMEWORKS_FOLDER_PATH}"
        echo "🧹 [SQUARE-FIX] Cleaning: \$FRAMEWORKS_DIR"

        # 1. Delete the 'setup' files (triggers Invalid Signature error)
        find "\$FRAMEWORKS_DIR" -name "setup" -print -delete || true
        
        # 2. Delete nested 'Frameworks' folders (triggers Disallowed Nested Bundles error)
        # This specifically targets SquareInAppPaymentsSDK.framework/Frameworks
        find "\$FRAMEWORKS_DIR" -name "Frameworks" -type d -mindepth 2 -print -exec rm -rf {} + || true
        
        echo "✅ [SQUARE-FIX] Compliance cleanup complete."
      `;

      xcodeProject.addBuildPhase(
        [], 
        'PBXShellScriptBuildPhase', 
        buildPhaseName, 
        xcodeProject.getFirstTarget().uuid, 
        { shellScript: script }
      );
    }

    return config;
  });
};