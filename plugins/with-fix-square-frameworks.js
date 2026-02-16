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

      // Fixed Ruby script - removed the problematic array syntax
      const postInstallCode = `
    # Function to find and copy CorePaymentCard framework
    def copy_core_payment_card_framework(installer)
      pods_root = installer.sandbox.root
      core_payment_card_path = File.join(pods_root, 'CorePaymentCard', 'CorePaymentCard.framework')
      
      if File.directory?(core_payment_card_path)
        puts "✅ Found CorePaymentCard.framework at: \#{core_payment_card_path}"
        
        # Get the app's build directory
        app_target = installer.aggregate_targets.first.user_project.targets.first
        if app_target
          build_settings = app_target.build_settings(nil)
          built_products_dir = build_settings['BUILT_PRODUCTS_DIR']
          frameworks_dir = File.join(built_products_dir, 'Frameworks')
          
          if File.directory?(frameworks_dir)
            # Copy the framework to the app's Frameworks directory
            destination = File.join(frameworks_dir, 'CorePaymentCard.framework')
            if !File.directory?(destination)
              puts "📋 Copying CorePaymentCard.framework to app bundle..."
              system("cp -R \\"\#{core_payment_card_path}\\" \\"\#{destination}\\"")
              
              # Fix the framework's internal paths
              framework_binary = File.join(destination, 'CorePaymentCard')
              if File.exist?(framework_binary)
                # Change the install name to be relative to @rpath
                system("install_name_tool -id @rpath/CorePaymentCard.framework/CorePaymentCard \\"\#{framework_binary}\\"")
              end
            end
          end
        end
      else
        puts "⚠️ CorePaymentCard.framework not found at: \#{core_payment_card_path}"
      end
    end

    # Main post_install fixes
    installer.pods_project.targets.each do |target|
      if target.name.include?('SquareInAppPaymentsSDK') || target.name.include?('SquareBuyerVerificationSDK')
        puts "🔧 Fixing \#{target.name}..."
        
        # Fix framework search paths - use proper Ruby array syntax
        target.build_configurations.each do |config|
          config.build_settings['FRAMEWORK_SEARCH_PATHS'] = ['$(inherited)', '${PODS_CONFIGURATION_BUILD_DIR}/SquareInAppPaymentsSDK']
          config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = ['$(inherited)', '@executable_path/Frameworks', '@loader_path/Frameworks']
        end
      end
      
      if target.name == 'CorePaymentCard'
        puts "🔧 Fixing CorePaymentCard target..."
        target.build_configurations.each do |config|
          config.build_settings['SKIP_INSTALL'] = 'NO'
          config.build_settings['INSTALL_PATH'] = '@rpath'
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end

    # Force copy CorePaymentCard framework after all targets are built
    copy_core_payment_card_framework(installer)
`;

      // Check if our fix is already injected
      if (podfileContent.includes('# Square SDK fix injected')) {
        console.log('✅ Square SDK fix already present in Podfile');
        return config;
      }

      // Find the post_install block and inject our code
      if (podfileContent.includes('post_install do |installer|')) {
        // Insert our code right after the post_install line
        podfileContent = podfileContent.replace(
          /(post_install do \|installer\|)(.*?)(?=end)/m,
          `$1${postInstallCode}`
        );
      } else {
        // If no post_install block exists, add one
        podfileContent += `\n\npost_install do |installer|${postInstallCode}\nend\n`;
      }

      // Add comment marker
      podfileContent = podfileContent.replace(
        'post_install do |installer|',
        'post_install do |installer| # Square SDK fix injected'
      );

      fs.writeFileSync(podfilePath, podfileContent);
      console.log('✅ Square SDK fix injected into Podfile');
      return config;
    },
  ]);
};