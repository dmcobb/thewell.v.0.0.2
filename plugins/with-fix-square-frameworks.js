// plugins/with-fix-square-frameworks.js
const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = (config) => {
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
      let podfileContent = fs.readFileSync(podfilePath, 'utf8');

      // Enhanced Ruby script to fix both framework structure AND rpath issues
      const postInstallCode = `
    installer.pods_project.targets.each do |target|
      if target.name.include?('SquareInAppPaymentsSDK') || target.name.include?('SquareBuyerVerificationSDK')
        puts "🔧 Cleaning Square SDK files from Pod: \#{target.name}"
        
        # Delete the 'setup' file that causes the signature error
        system("find \\"\#{installer.sandbox.root}\\" -name 'setup' -delete")
        
        # Delete the nested 'Frameworks' folder that causes the bundle error
        system("find \\"\#{installer.sandbox.root}\\" -name 'Frameworks' -type d -exec rm -rf {} +")
        
        # Fix framework headers and structure
        target.build_configurations.each do |config|
          # Ensure framework search paths include the correct locations
          config.build_settings['FRAMEWORK_SEARCH_PATHS'] = ['$(inherited)', '${PODS_CONFIGURATION_BUILD_DIR}/SquareInAppPaymentsSDK']
          
          # Add rpath for CorePaymentCard
          config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = [
            '$(inherited)',
            '@executable_path/Frameworks',
            '@loader_path/Frameworks'
          ]
        end
      end
    end
    
    # Additional fix for CorePaymentCard rpath
    installer.pods_project.targets.each do |target|
      if target.name == 'CorePaymentCard'
        puts "🔧 Fixing CorePaymentCard rpath..."
        target.build_configurations.each do |config|
          config.build_settings['SKIP_INSTALL'] = 'NO'
          config.build_settings['INSTALL_PATH'] = '@rpath'
        end
      end
    end
`;

      if (podfileContent.includes('post_install do |installer|')) {
        // Replace the entire post_install block to avoid duplication
        if (podfileContent.includes('# Square SDK fix injected')) {
          // If already injected, replace it
          const postInstallRegex = /post_install do \|installer\|(.*?)end/m;
          podfileContent = podfileContent.replace(postInstallRegex, 
            `post_install do |installer|${postInstallCode}  end`);
        } else {
          // Inject at the top of existing post_install block
          podfileContent = podfileContent.replace(
            'post_install do |installer|',
            `post_install do |installer|${postInstallCode}`
          );
        }
      } else {
        podfileContent += `\npost_install do |installer|\n${postInstallCode}\nend\n`;
      }

      fs.writeFileSync(podfilePath, podfileContent);
      console.log('✅ Square SDK fix injected into Podfile');
      return config;
    },
  ]);

  // Also modify the Xcode project to ensure proper framework linking
  config = withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    
    // Find the main target
    const target = xcodeProject.getFirstTarget().uuid;
    
    // Add CorePaymentCard as a required framework if not already present
    const frameworks = xcodeProject.pbxFrameworksBuildPhaseObj(target);
    if (frameworks) {
      const hasCorePaymentCard = frameworks.files.some(file => 
        file.comment && file.comment.includes('CorePaymentCard')
      );
      
      if (!hasCorePaymentCard) {
        // You might need to add the framework here, but it's tricky with dynamic paths
        console.log('⚠️  CorePaymentCard framework may need manual linking in Xcode');
      }
    }
    
    return config;
  });

  return config;
};