const { withXcodeProject } = require('@expo/config-plugins');

console.log("🚀 [withSquareFix] Plugin module loaded");
console.log("📂 Plugin directory:", __dirname);

module.exports = function withSquareFix(config) {
  console.log("🔧 [withSquareFix] Plugin function called");
  console.log("📱 Current config name:", config.name);
  
  return withXcodeProject(config, async (config) => {
    console.log("📝 [withSquareFix] Modifying Xcode project...");
    
    const xcodeProject = config.modResults;
    console.log("✅ [withSquareFix] Got Xcode project");
    
    // Find the main app target
    console.log("🔍 [withSquareFix] Looking for app target...");
    const targets = xcodeProject.pbxNativeTargetSection();
    const target = Object.values(targets).find(t => t.productType === 'com.apple.product-type.application');
    
    if (!target) {
      console.log("❌ [withSquareFix] No app target found!");
      console.log("Available target types:", Object.values(targets).map(t => t.productType));
      return config;
    }

    console.log("✅ [withSquareFix] Found app target:", target.name);
    console.log("Target UUID:", target.uuid);
    
    const targetUuid = target.uuid;
    
    // Check if our build phase already exists
    console.log("🔍 [withSquareFix] Checking if Square Fix phase already exists...");
    const hasSquareFixPhase = xcodeProject.buildPhaseObject('PBXShellScriptBuildPhase', 'Square Fix', targetUuid);
    
    if (!hasSquareFixPhase) {
      console.log("➕ [withSquareFix] Adding Square Fix build phase...");
      
      // Add the build phase - this automatically adds it to the end
      console.log("Creating build phase with addBuildPhase...");
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
echo "🔧 [SQUARE-FIX] Cleaning and Signing Square Frameworks"
echo "========================================="

# Wait for frameworks to be embedded
sleep 2

# Find the app bundle
APP_BUNDLE="\${CODESIGNING_FOLDER_PATH}"
if [ -z "$APP_BUNDLE" ]; then
    echo "❌ CODESIGNING_FOLDER_PATH not set"
    exit 1
fi

FRAMEWORKS_PATH="\${APP_BUNDLE}/Frameworks"
echo "📂 Frameworks path: \$FRAMEWORKS_PATH"

if [ ! -d "\$FRAMEWORKS_PATH" ]; then
    echo "❌ Frameworks directory not found"
    exit 1
fi

# Process each Square framework
for framework in "SquareInAppPaymentsSDK.framework" "SquareBuyerVerificationSDK.framework"; do
    FRAMEWORK_PATH="\$FRAMEWORKS_PATH/\$framework"
    
    if [ ! -d "\$FRAMEWORK_PATH" ]; then
        echo "⚠️ \$framework not found, skipping..."
        continue
    fi
    
    echo "🔍 Processing: \$framework"
    
    # Remove nested Frameworks folders
    find "\$FRAMEWORK_PATH" -name "Frameworks" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Remove setup file
    find "\$FRAMEWORK_PATH" -name "setup" -type f -delete 2>/dev/null || true
    
    # Remove any nested .framework bundles
    find "\$FRAMEWORK_PATH" -name "*.framework" -type d -not -path "\$FRAMEWORK_PATH" -exec rm -rf {} + 2>/dev/null || true
    
    # Sign the framework
    echo "  ✍️ Signing \$framework..."
    /usr/bin/codesign --force --deep --sign "\${EXPANDED_CODE_SIGN_IDENTITY}" \\
        --preserve-metadata=identifier,entitlements,flags \\
        --timestamp=none "\$FRAMEWORK_PATH"
    
    if [ \$? -eq 0 ]; then
        echo "  ✅ Successfully signed \$framework"
    else
        echo "  ❌ Failed to sign \$framework"
        exit 1
    fi
done

echo ""
echo "✅ [SQUARE-FIX] Completed"
echo "========================================="
`
        }
      );

      console.log("✅ [withSquareFix] Build phase added");
      console.log("Phase return value:", phase);

      // Get the phase ID from the returned value
      const phaseId = Array.isArray(phase) ? phase[0] : phase;
      console.log("Phase ID:", phaseId);
      
      // Get all build phases for the target
      console.log("Current build phases order:");
      const buildPhases = target.buildPhases.map(phase => phase.value);
      
      // Log all build phases with their names
      buildPhases.forEach((phaseUuid, index) => {
        const phaseObj = xcodeProject.getPBXObjectByUUID(phaseUuid);
        console.log(`  ${index}: ${phaseObj?.isa} - ${phaseObj?.name || 'unnamed'}`);
      });
      
      // Find the index of "Embed Frameworks" phase
      const embedIndex = buildPhases.findIndex(phaseUuid => {
        const phaseObj = xcodeProject.getPBXObjectByUUID(phaseUuid);
        return phaseObj && phaseObj.isa === 'PBXCopyFilesBuildPhase' && phaseObj.name === 'Embed Frameworks';
      });

      // Find the index of our new phase
      const fixIndex = buildPhases.findIndex(phaseUuid => phaseUuid === phaseId);

      console.log("Embed Frameworks index:", embedIndex);
      console.log("Square Fix index:", fixIndex);

      if (embedIndex !== -1 && fixIndex !== -1 && fixIndex > embedIndex + 1) {
        console.log("🔄 [withSquareFix] Reordering build phases to put Square Fix after Embed Frameworks");
        
        // Remove our phase from its current position
        buildPhases.splice(fixIndex, 1);
        
        // Insert it right after Embed Frameworks
        buildPhases.splice(embedIndex + 1, 0, phaseId);
        
        // Update the target's build phases
        target.buildPhases = buildPhases.map(phaseUuid => ({ value: phaseUuid, comment: null }));
        
        console.log("✅ [withSquareFix] Build phases reordered");
        
        // Log the new order
        console.log("New build phases order:");
        buildPhases.forEach((phaseUuid, index) => {
          const phaseObj = xcodeProject.getPBXObjectByUUID(phaseUuid);
          console.log(`  ${index}: ${phaseObj?.isa} - ${phaseObj?.name || 'unnamed'}`);
        });
      } else if (embedIndex === -1) {
        console.log("⚠️ [withSquareFix] Could not find 'Embed Frameworks' phase");
      } else if (fixIndex === -1) {
        console.log("⚠️ [withSquareFix] Could not find newly added 'Square Fix' phase");
      } else {
        console.log("✅ [withSquareFix] Square Fix phase is already in correct position");
      }
    } else {
      console.log("✅ [withSquareFix] Square Fix build phase already exists, skipping");
    }

    console.log("✅ [withSquareFix] Xcode project modification complete");
    return config;
  });
};