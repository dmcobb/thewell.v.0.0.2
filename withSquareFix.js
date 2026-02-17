// withSquareFix.js
const { withXcodeProject } = require('@expo/config-plugins');

module.exports = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const targetUuid = xcodeProject.getFirstTarget().uuid;

    // This script runs INSIDE the macOS build environment during compilation
    const squareSetupScript = `
FRAMEWORKS="\${BUILT_PRODUCTS_DIR}/\${FRAMEWORKS_FOLDER_PATH}"
if [ -d "\${FRAMEWORKS}/SquareInAppPaymentsSDK.framework" ]; then
  echo "🔧 Running Square Setup Script to fix DYLD linking..."
  "\${FRAMEWORKS}/SquareInAppPaymentsSDK.framework/setup"
else
  echo "⚠️ Square framework not found in build directory, skipping setup script."
fi
    `;

    xcodeProject.addBuildPhase(
      [],
      'PBXShellScriptBuildPhase',
      'Fix Square DYLD Error',
      targetUuid,
      {
        shellPath: '/bin/sh',
        shellScript: squareSetupScript,
      }
    );

    return config;
  });
};
