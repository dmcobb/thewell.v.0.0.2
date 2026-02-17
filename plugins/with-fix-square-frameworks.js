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
      if (podfileContent.includes('# Square SDK and Hermes fixes injected')) {
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

      // Updated post_install code that removes macOS and tablet support
      const postInstallCode = `
    puts "🔧 Removing macOS and tablet support (Square SDK compatibility)..."
    
    installer.pods_project.targets.each do |target|
      # Remove macOS and tablet support from ALL targets
      target.build_configurations.each do |config|
        # Explicitly remove macOS support
        config.build_settings['SUPPORTED_PLATFORMS'] = 'iphoneos iphonesimulator'
        config.build_settings['TARGETED_DEVICE_FAMILY'] = '1,2'  # 1 = iPhone, 2 = iPad (remove if you don't want iPad)
        
        # Remove any macOS-specific build settings
        config.build_settings['MACOSX_DEPLOYMENT_TARGET'] = nil
        config.build_settings['SDKROOT'] = 'iphoneos'
        
        # Set iOS deployment target
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '26.0'
      end
      
      # Specific fix for hermes-engine
      if target.name == 'hermes-engine'
        puts "🔧 Fixing Hermes for iOS only..."
        target.build_configurations.each do |config|
          # Force use prebuilt binary
          config.build_settings['HERMES_BUILD_FROM_SOURCE'] = 'NO'
          
          # Only build for iOS
          config.build_settings['SUPPORTED_PLATFORMS'] = 'iphoneos iphonesimulator'
          
          # Fix simulator builds on Apple Silicon
          if config.name.include?('Debug') && \`sysctl -n hw.optional.arm64 2>/dev/null\`.strip.to_i == 1
            config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
          end
        end
      end
      
      # Square SDK specific fixes
      if target.name.include?('SquareInAppPaymentsSDK') || target.name.include?('SquareBuyerVerificationSDK')
        puts "🔧 Fixing Square SDK: \#{target.name}"
        target.build_configurations.each do |config|
          config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = [
            '$(inherited)',
            '@executable_path/Frameworks',
            '@loader_path/Frameworks'
          ]
          # Ensure no macOS support for Square SDK
          config.build_settings['SUPPORTED_PLATFORMS'] = 'iphoneos iphonesimulator'
        end
      end
      
      if target.name == 'CorePaymentCard'
        puts "🔧 Fixing CorePaymentCard..."
        target.build_configurations.each do |config|
          config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = [
            '$(inherited)',
            '@executable_path/Frameworks',
            '@loader_path/Frameworks'
          ]
          config.build_settings['SKIP_INSTALL'] = 'NO'
          config.build_settings['INSTALL_PATH'] = '@rpath'
          # Ensure no macOS support for CorePaymentCard
          config.build_settings['SUPPORTED_PLATFORMS'] = 'iphoneos iphonesimulator'
        end
      end
    end

    # Clean up Square SDK files
    system("find \\"\#{installer.sandbox.root}\\" -name 'setup' -delete 2>/dev/null || true")
    system("find \\"\#{installer.sandbox.root}\\" -name 'Frameworks' -type d -exec rm -rf {} + 2>/dev/null || true")
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
        'post_install do |installer| # Square SDK and Hermes fixes injected - macOS/tablet support removed'
      );

      fs.writeFileSync(podfilePath, podfileContent);
      console.log('✅ iOS deployment target set to 26.0');
      console.log('✅ macOS and tablet support removed from all targets');
      console.log('✅ Square SDK and Hermes fixes applied');
      
      return config;
    },
  ]);
};