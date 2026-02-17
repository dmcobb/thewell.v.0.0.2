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

      // Updated post_install code with iOS 26.0
      const postInstallCode = `
    # Check the architecture
    is_apple_silicon = \`sysctl -n hw.optional.arm64 2>/dev/null\`.strip.to_i == 1
    is_macos = RUBY_PLATFORM.include?('darwin')
    
    puts "🔍 Running on \#{is_apple_silicon ? 'Apple Silicon' : 'Intel'} Mac"
    
    installer.pods_project.targets.each do |target|
      # Fix for hermes-engine - prevent macOS builds
      if target.name == 'hermes-engine'
        puts "🔧 Fixing Hermes build for simulator only..."
        target.build_configurations.each do |config|
          # Set deployment target
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '26.0'
          
          # CRITICAL: Prevent building for macOS
          config.build_settings['SUPPORTED_PLATFORMS'] = 'iphonesimulator iphoneos'
          config.build_settings['VALID_ARCHS[sdk=iphoneos*]'] = 'arm64'
          config.build_settings['VALID_ARCHS[sdk=iphonesimulator*]'] = 'x86_64 arm64'
          
          # For simulator builds, exclude arm64 if needed
          if config.name.include?('Debug') && is_apple_silicon
            config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
          end
          
          # Force use prebuilt binary
          config.build_settings['HERMES_BUILD_FROM_SOURCE'] = 'NO'
          
          # Don't build for macOS
          config.build_settings['MACOSX_DEPLOYMENT_TARGET'] = nil
        end
      end
      
      # Ensure all targets use at least iOS 26.0
      target.build_configurations.each do |config|
        current_target = config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f
        if current_target < 26.0 && current_target > 0
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '26.0'
        end
      end
      
      # Your existing Square SDK fixes
      if target.name.include?('SquareInAppPaymentsSDK') || target.name.include?('SquareBuyerVerificationSDK')
        puts "🔧 Fixing Square SDK: \#{target.name}"
        target.build_configurations.each do |config|
          config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = [
            '$(inherited)',
            '@executable_path/Frameworks',
            '@loader_path/Frameworks'
          ]
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '26.0'
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
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '26.0'
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
        'post_install do |installer| # Square SDK and Hermes fixes injected'
      );

      fs.writeFileSync(podfilePath, podfileContent);
      console.log('✅ Updated iOS deployment target to 26.0');
      console.log('✅ Square SDK and Hermes fixes injected into Podfile');
      console.log('✅ Hermes will now only build for iOS/simulator, not macOS');
      
      return config;
    },
  ]);
};