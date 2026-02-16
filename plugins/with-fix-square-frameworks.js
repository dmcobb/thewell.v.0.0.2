// plugins/with-fix-square-frameworks.js
const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = (config) => {
  // First, modify the Podfile
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
      let podfileContent = fs.readFileSync(podfilePath, 'utf8');

      // Enhanced Ruby script to fix framework issues
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
        
        # Remove problematic files
        target.build_configurations.each do |config|
          config.build_settings['FRAMEWORK_SEARCH_PATHS'] = ['$(inherited)', '$(PODS_CONFIGURATION_BUILD_DIR)/SquareInAppPaymentsSDK']
          config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = [
            '$(inherited)',
            '@executable_path/Frameworks',
            '@loader_path/Frameworks'
          ]
        end
      end
      
      if target.name == 'CorePaymentCard'
        puts "🔧 Fixing CorePaymentCard target..."
        target.build_configurations.each do |config|
          config.build_settings['SKIP_INSTALL'] = 'NO'
          config.build_settings['INSTALL_PATH'] = '@rpath'
          config.build_settings['FRAMEWORK_SEARCH_PATHS'] = ['$(inherited)']
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'  # Disable signing for now
        end
      end
    end

    # Force copy CorePaymentCard framework after all targets are built
    copy_core_payment_card_framework(installer)
`;

      // Inject the code into Podfile
      if (podfileContent.includes('post_install do |installer|')) {
        if (podfileContent.includes('# Square SDK fix injected')) {
          const postInstallRegex = /post_install do \|installer\|(.*?)end/m;
          podfileContent = podfileContent.replace(postInstallRegex, 
            `post_install do |installer|${postInstallCode}  end`);
        } else {
          podfileContent = podfileContent.replace(
            'post_install do |installer|',
            `post_install do |installer|${postInstallCode}`
          );
        }
      } else {
        podfileContent += `\npost_install do |installer|\n${postInstallCode}\nend\n`;
      }

      // Add comment marker
      podfileContent = podfileContent.replace('post_install do |installer|', 
        'post_install do |installer| # Square SDK fix injected');

      fs.writeFileSync(podfilePath, podfileContent);
      console.log('✅ Square SDK fix injected into Podfile');
      return config;
    },
  ]);

  // Now modify the Xcode project to ensure proper framework linking
  config = withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    
    // Find the main target
    const target = xcodeProject.getFirstTarget().uuid;
    
    // Add runpath search paths to the main target
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    
    Object.keys(configurations).forEach(key => {
      const config = configurations[key];
      if (config && config.buildSettings) {
        // Ensure LD_RUNPATH_SEARCH_PATHS includes @executable_path/Frameworks
        let runpathPaths = config.buildSettings.LD_RUNPATH_SEARCH_PATHS || [];
        if (!Array.isArray(runpathPaths)) {
          runpathPaths = [runpathPaths];
        }
        
        const requiredPaths = [
          '$(inherited)',
          '@executable_path/Frameworks',
          '@loader_path/Frameworks'
        ];
        
        requiredPaths.forEach(path => {
          if (!runpathPaths.includes(path)) {
            runpathPaths.push(path);
          }
        });
        
        config.buildSettings.LD_RUNPATH_SEARCH_PATHS = runpathPaths;
        
        // Also ensure FRAMEWORK_SEARCH_PATHS includes the right locations
        let frameworkPaths = config.buildSettings.FRAMEWORK_SEARCH_PATHS || [];
        if (!Array.isArray(frameworkPaths)) {
          frameworkPaths = [frameworkPaths];
        }
        
        const requiredFrameworkPaths = [
          '$(inherited)',
          '$(PROJECT_DIR)/Pods/CorePaymentCard',
          '$(PROJECT_DIR)/Pods/SquareInAppPaymentsSDK',
          '$(PROJECT_DIR)/Pods/SquareBuyerVerificationSDK'
        ];
        
        requiredFrameworkPaths.forEach(path => {
          if (!frameworkPaths.includes(path)) {
            frameworkPaths.push(path);
          }
        });
        
        config.buildSettings.FRAMEWORK_SEARCH_PATHS = frameworkPaths;
      }
    });
    
    console.log('✅ Xcode project updated with correct framework search paths');
    return config;
  });

  return config;
};