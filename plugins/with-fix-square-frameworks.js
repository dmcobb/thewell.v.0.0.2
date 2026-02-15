const { withXcodeProject } = require('@expo/config-plugins');

module.exports = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    
    // This script is injected into Xcode and runs on the EAS build machine
    const shellScript = `
      set -e
      echo "🚀 Starting Square SDK Deep Clean..."

      # 1. Path to the actual app bundle being built
      APP_PATH="$CODESIGNING_FOLDER_PATH"
      echo "Checking bundle at: $APP_PATH"

      # 2. Find and destroy disallowed 'Frameworks' folders inside other frameworks
      # Apple Error: "contains disallowed file 'Frameworks'"
      find "$APP_PATH/Frameworks" -name "Frameworks" -type d -prune -exec rm -rf {} + || true

      # 3. Find and destroy 'setup' files
      # Apple Error: "Invalid Signature. Code object is not signed at all... /setup"
      find "$APP_PATH/Frameworks" -name "setup" -type f -delete || true

      echo "✅ Deep clean complete. Disallowed files removed."
    `;

    xcodeProject.addBuildPhase(
      [],
      'PBXShellScriptBuildPhase',
      'Fix Square SDK for App Store',
      null,
      {
        shellPath: '/bin/sh',
        shellScript: shellScript,
        runOnlyForDeploymentPostprocessing: '1' // CRITICAL: This makes it run right before signing
      }
    );

    return config;
  });
};