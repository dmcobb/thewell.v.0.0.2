// plugins/with-fix-square-frameworks.js
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
      
      // Only proceed if Podfile exists
      if (!fs.existsSync(podfilePath)) {
        console.log('⚠️ Podfile not found, skipping plugin');
        return config;
      }
      
      let podfileContent = fs.readFileSync(podfilePath, 'utf8');

      // Check if our fix is already injected
      if (podfileContent.includes('# Square SDK rpath fix')) {
        console.log('✅ Square SDK rpath fix already present in Podfile');
        return config;
      }

      // Simple fix that ONLY adds rpath settings
      const rpathFixCode = `
    # Add rpath for CorePaymentCard
    installer.pods_project.targets.each do |target|
      if target.name.include?('SquareInAppPaymentsSDK') || target.name.include?('SquareBuyerVerificationSDK') || target.name == 'CorePaymentCard'
        puts "🔧 Fixing rpath for \#{target.name}..."
        target.build_configurations.each do |config|
          config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = ['$(inherited)', '@executable_path/Frameworks', '@loader_path/Frameworks']
        end
      end
    end
`;

      // Find the post_install block and inject our code before react_native_post_install
      if (podfileContent.includes('post_install do |installer|')) {
        // Insert our code right after the post_install line, before react_native_post_install
        podfileContent = podfileContent.replace(
          /(post_install do \|installer\|.*?)(react_native_post_install)/ms,
          `$1${rpathFixCode}\n  $2`
        );
        
        // Add comment marker
        podfileContent = podfileContent.replace(
          'post_install do |installer|',
          'post_install do |installer| # Square SDK rpath fix'
        );
      }

      fs.writeFileSync(podfilePath, podfileContent);
      console.log('✅ Square SDK rpath fix injected into Podfile');
      return config;
    },
  ]);
};