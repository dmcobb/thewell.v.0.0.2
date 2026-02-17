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

      // Ensure CorePaymentCard is configured as a dynamic framework during pod install
      const postInstallCode = `
    puts "🔧 Configuring CorePaymentCard as dynamic framework..."
    
    # Configure CorePaymentCard target
    installer.pods_project.targets.each do |target|
      if target.name == 'CorePaymentCard'
        puts "✅ Found CorePaymentCard target, configuring as dynamic framework..."
        target.build_configurations.each do |config|
          # Make it a dynamic framework
          config.build_settings['MACH_O_TYPE'] = 'mh_dylib'
          config.build_settings['SKIP_INSTALL'] = 'NO'
          config.build_settings['INSTALL_PATH'] = '@rpath'
          config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = [
            '$(inherited)',
            '@executable_path/Frameworks',
            '@loader_path/Frameworks'
          ]
          # Ensure it's built for device
          config.build_settings['SUPPORTED_PLATFORMS'] = 'iphoneos'
          config.build_settings['VALID_ARCHS'] = 'arm64'
        end
      end
      
      # Configure Square SDK targets
      if target.name.include?('SquareInAppPaymentsSDK') || target.name.include?('SquareBuyerVerificationSDK')
        puts "🔧 Configuring \#{target.name} rpaths..."
        target.build_configurations.each do |config|
          config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = [
            '$(inherited)',
            '@executable_path/Frameworks',
            '@loader_path/Frameworks'
          ]
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
        'post_install do |installer| # Square SDK and CorePaymentCard dynamic framework config'
      );

      fs.writeFileSync(podfilePath, podfileContent);
      console.log('✅ CorePaymentCard configured as dynamic framework (will be processed during pod install)');
      console.log('✅ Run `cd ios && pod install` after prebuild to apply changes');
      
      return config;
    },
  ]);
};