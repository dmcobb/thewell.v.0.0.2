const { withXcodeProject } = require('@expo/config-plugins');

module.exports = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    
    // This script runs on the EAS build server during the Xcode build process.
    // It targets the actual built bundle to remove the files Apple is flagging.
    const shellScript = `
      echo "🔧 Cleaning Square SDK for App Store submission..."
      
      # Find all Square frameworks within the build target folder
      find "$TARGET_BUILD_DIR/$FRAMEWORKS_FOLDER_PATH" -name "Square*.framework" -type d | while read -r framework; do
        echo "Processing: $framework"
        
        # 1. Remove nested Frameworks (Fixes: Disallowed file 'Frameworks')
        if [ -d "$framework/Frameworks" ]; then
          rm -rf "$framework/Frameworks"
          echo "  ✅ Removed nested Frameworks folder"
        fi
        
        # 2. Remove the setup file (Fixes: Invalid Signature/Unsigned code)
        if [ -f "$framework/setup" ]; then
          rm -f "$framework/setup"
          echo "  ✅ Removed unsigned setup file"
        fi
      done
    `;

    xcodeProject.addBuildPhase(
      [],
      'PBXShellScriptBuildPhase',
      'Fix Square SDK Bundling',
      null,
      {
        shellPath: '/bin/sh',
        shellScript: shellScript,
        runOnlyForDeploymentPostprocessing: '1' // Ensures it runs during archiving for TestFlight
      }
    );

    return config;
  });
};