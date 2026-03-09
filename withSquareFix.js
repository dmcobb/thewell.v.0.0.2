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
      console.log(`🚀 [SQUARE-FIX] Injecting Final Cleanup Phase`);
      
      // Use double-backslashes to ensure the $ stays for the Shell to read
      const script = `
        set -e
        FRAMEWORKS_DIR="\${TARGET_BUILD_DIR}/\${FRAMEWORKS_FOLDER_PATH}"
        echo "🧹 [SQUARE-FIX] Cleaning: \$FRAMEWORKS_DIR"

        # 1. Remove setup files (fixes signature error)
        find "\$FRAMEWORKS_DIR" -name "setup" -print -delete || true
        
        # 2. Remove nested Frameworks (fixes disallowed bundle error)
        find "\$FRAMEWORKS_DIR" -name "Frameworks" -type d -mindepth 2 -print -exec rm -rf {} + || true
        
        echo "✅ [SQUARE-FIX] Cleanup complete."
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