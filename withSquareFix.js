const { withXcodeProject } = require('@expo/config-plugins');

console.log("🚀 [withSquareFix] Plugin module loaded");

module.exports = function withSquareFix(config) {
  console.log("🔧 [withSquareFix] Plugin function called");
  
  return withXcodeProject(config, async (config) => {
    console.log("📝 [withSquareFix] Modifying Xcode project...");
    
    const xcodeProject = config.modResults;
    
    // Find the main app target
    const targets = xcodeProject.pbxNativeTargetSection();
    const target = Object.values(targets).find(t => t.productType === 'com.apple.product-type.application');
    
    if (!target) {
      console.log("❌ [withSquareFix] No app target found!");
      return config;
    }

    console.log("✅ [withSquareFix] Found app target:", target.name);
    const targetUuid = target.uuid;
    
    // Check if our build phase already exists
    const hasSquareFixPhase = xcodeProject.buildPhaseObject('PBXShellScriptBuildPhase', 'Square Fix', targetUuid);
    
    if (!hasSquareFixPhase) {
      console.log("➕ [withSquareFix] Adding Square Fix build phase...");
      
      const phase = xcodeProject.addBuildPhase(
        [],
        'PBXShellScriptBuildPhase',
        'Square Fix',
        targetUuid,
        {
          isa: 'PBXShellScriptBuildPhase',
          buildActionMask: 2147483647,
          files: [],
          inputPaths: [],
          name: 'Square Fix',
          outputPaths: [],
          runOnlyForDeploymentPostprocessing: 0,
          shellPath: '/bin/bash',
          shellScript: `#!/bin/bash
echo "========================================="
echo "🔧 [SQUARE-FIX] Running Square SDK Setup"
echo "========================================="

# Find the app bundle
APP_BUNDLE="\${CODESIGNING_FOLDER_PATH}"
FRAMEWORKS_PATH="\${APP_BUNDLE}/Frameworks"

echo "📂 Frameworks path: \$FRAMEWORKS_PATH"

if [ ! -d "\$FRAMEWORKS_PATH" ]; then
    echo "❌ Frameworks directory not found"
    exit 1
fi

# STEP 1: RUN SQUARE'S OFFICIAL SETUP SCRIPT (THIS IS CRITICAL)
echo "🏃 Running Square SDK setup script..."
"\${FRAMEWORKS_PATH}/SquareInAppPaymentsSDK.framework/setup"

# STEP 2: Remove ONLY the nested Frameworks folders (but keep the framework files)
for framework in "SquareInAppPaymentsSDK.framework" "SquareBuyerVerificationSDK.framework"; do
    FRAMEWORK_PATH="\$FRAMEWORKS_PATH/\$framework"
    
    if [ ! -d "\$FRAMEWORK_PATH" ]; then
        continue
    fi
    
    echo "🔍 Processing: \$framework"
    
    # Remove nested Frameworks folders (but KEEP CorePaymentCard)
    find "\$FRAMEWORK_PATH" -name "Frameworks" -type d -not -path "*CorePaymentCard*" -exec rm -rf {} + 2>/dev/null || true
    
    # NOW sign the framework
    echo "  ✍️ Signing \$framework..."
    /usr/bin/codesign --force --deep --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" "\$FRAMEWORK_PATH"
done

# STEP 3: Make sure CorePaymentCard is signed
if [ -d "\$FRAMEWORKS_PATH/CorePaymentCard.framework" ]; then
    echo "  ✍️ Signing CorePaymentCard.framework..."
    /usr/bin/codesign --force --deep --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" "\$FRAMEWORKS_PATH/CorePaymentCard.framework"
fi

echo "✅ [SQUARE-FIX] Completed"
`
        }
      );

      // Get the phase ID and reorder after Embed Frameworks
      const phaseId = Array.isArray(phase) ? phase[0] : phase;
      const buildPhases = target.buildPhases.map(phase => phase.value);
      
      const embedIndex = buildPhases.findIndex(phaseUuid => {
        const phaseObj = xcodeProject.getPBXObjectByUUID(phaseUuid);
        return phaseObj && phaseObj.isa === 'PBXCopyFilesBuildPhase' && phaseObj.name === 'Embed Frameworks';
      });

      const fixIndex = buildPhases.findIndex(phaseUuid => phaseUuid === phaseId);

      if (embedIndex !== -1 && fixIndex !== -1 && fixIndex > embedIndex + 1) {
        buildPhases.splice(fixIndex, 1);
        buildPhases.splice(embedIndex + 1, 0, phaseId);
        target.buildPhases = buildPhases.map(phaseUuid => ({ value: phaseUuid, comment: null }));
        console.log("✅ [withSquareFix] Build phases reordered");
      }
    }

    return config;
  });
};