// plugins/with-fix-square-frameworks.js
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
      let podfileContent = fs.readFileSync(podfilePath, 'utf8');

      // Update the iOS platform version to 26.0
      podfileContent = podfileContent.replace(
        /platform :ios, '.*?'/,
        "platform :ios, '26.0'"
      );

      // Check if our fix is already injected
      if (podfileContent.includes('# Square SDK and CorePaymentCard fixes')) {
        console.log('✅ Fixes already present in Podfile');
        return config;
      }

      // Fix the use_react_native! call to use prebuilt Hermes
      const useReactNativeRegex = /use_react_native!\(\s*:path => config\[:reactNativePath\],\s*:hermes_enabled => true,?/;
      
      if (podfileContent.match(useReactNativeRegex)) {
        podfileContent = podfileContent.replace(
          useReactNativeRegex,
          `use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :hermes_engine => {
      :hermes_binary => {
        :path => '../node_modules/react-native/sdks/hermes/hermes.xcframework'
      }
    },`
        );
        console.log('✅ Updated use_react_native! to use prebuilt Hermes');
      }

      // Post_install code that adds pre-build cleanup phase
      const postInstallCode = `
    puts "🔧 Setting up Square SDK pre-build cleanup..."
    
    # Configure CorePaymentCard as dynamic framework
    installer.pods_project.targets.each do |target|
      if target.name == 'CorePaymentCard'
        puts "✅ Configuring CorePaymentCard as dynamic framework..."
        target.build_configurations.each do |config|
          config.build_settings['MACH_O_TYPE'] = 'mh_dylib'
          config.build_settings['SKIP_INSTALL'] = 'NO'
          config.build_settings['INSTALL_PATH'] = '@rpath'
          config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = [
            '$(inherited)',
            '@executable_path/Frameworks',
            '@loader_path/Frameworks'
          ]
        end
      end
    end

    # Add a PRE-BUILD phase to clean Square SDK frameworks BEFORE they are processed
    target = installer.aggregate_targets.first.user_targets.first
    
    # Check if phase already exists
    phase_exists = false
    target.build_phases.each do |phase|
      if phase.display_name == 'Clean Square SDK Frameworks'
        phase_exists = true
        break
      end
    end
    
    unless phase_exists
      puts "🔧 Adding pre-build cleanup phase for Square SDK frameworks..."
      
      # Create new shell script phase
      clean_phase = target.new_shell_script_build_phase('Clean Square SDK Frameworks')
      clean_phase.shell_script = <<-CLEAN
#!/bin/bash
echo "🔧 CLEANING SQUARE SDK FRAMEWORKS BEFORE BUILD..."

# Define paths
PODS_ROOT="\${SRCROOT}/Pods"
APP_FRAMEWORKS_DIR="\${TARGET_BUILD_DIR}/\${FRAMEWORKS_FOLDER_PATH}"

# Clean source frameworks in Pods (prevent them from being copied with nested files)
echo "Cleaning Square SDK frameworks in Pods..."
find "\${PODS_ROOT}" -name 'SquareInAppPaymentsSDK.framework' -type d | while read framework; do
  echo "  Cleaning: \$framework"
  # Remove nested Frameworks folder
  rm -rf "\$framework/Frameworks" 2>/dev/null || true
  # Remove setup file
  rm -f "\$framework/setup" 2>/dev/null || true
done

find "\${PODS_ROOT}" -name 'SquareBuyerVerificationSDK.framework' -type d | while read framework; do
  echo "  Cleaning: \$framework"
  # Remove nested Frameworks folder
  rm -rf "\$framework/Frameworks" 2>/dev/null || true
  # Remove setup file
  rm -f "\$framework/setup" 2>/dev/null || true
done

# Also clean any already copied frameworks in build dir (just in case)
if [ -d "\${APP_FRAMEWORKS_DIR}" ]; then
  echo "Cleaning Square SDK frameworks in build directory..."
  find "\${APP_FRAMEWORKS_DIR}" -name 'SquareInAppPaymentsSDK.framework' -type d | while read framework; do
    rm -rf "\$framework/Frameworks" 2>/dev/null || true
    rm -f "\$framework/setup" 2>/dev/null || true
  done
  find "\${APP_FRAMEWORKS_DIR}" -name 'SquareBuyerVerificationSDK.framework' -type d | while read framework; do
    rm -rf "\$framework/Frameworks" 2>/dev/null || true
    rm -f "\$framework/setup" 2>/dev/null || true
  done
fi

echo "✅ Square SDK frameworks cleaned"
CLEAN
      
      # Move the clean phase to the beginning (before Compile Sources)
      target.build_phases.unshift(target.build_phases.pop)
      puts "✅ Pre-build cleanup phase added"
    end
`;

      // Handle post_install block
      if (podfileContent.includes('post_install do |installer|')) {
        const postInstallRegex = /post_install do \|installer\|(.*?)end/m;
        podfileContent = podfileContent.replace(postInstallRegex, 
          `post_install do |installer|${postInstallCode}  end`);
      } else {
        podfileContent += `\npost_install do |installer|${postInstallCode}\nend\n`;
      }

      // Add marker comment
      podfileContent = podfileContent.replace(
        'post_install do |installer|',
        'post_install do |installer| # Square SDK and CorePaymentCard fixes'
      );

      fs.writeFileSync(podfilePath, podfileContent);
      console.log('✅ Added pre-build cleanup phase for Square SDK frameworks');
      console.log('✅ CorePaymentCard configured as dynamic framework');
      
      return config;
    },
  ]);
};