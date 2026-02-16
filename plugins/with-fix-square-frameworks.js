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

      // This Ruby script is injected into your Podfile's post_install block.
      // It deletes illegal files AND adds rpath for CorePaymentCard
      const postInstallCode = `
    installer.pods_project.targets.each do |target|
      if target.name.include?('SquareInAppPaymentsSDK') || target.name.include?('SquareBuyerVerificationSDK')
        puts "Cleaning Square SDK files from Pod: #{target.name}"
        # Delete the 'setup' file that causes the signature error
        system("find \\"\#{installer.sandbox.root}\\" -name 'setup' -delete")
        # Delete the nested 'Frameworks' folder that causes the bundle error
        system("find \\"\#{installer.sandbox.root}\\" -name 'Frameworks' -type d -exec rm -rf {} +")
      end
      
      # ADD RPATH FIX FOR COREPAYMENTCARD
      if target.name == 'CorePaymentCard' || target.name.include?('Square')
        puts "🔧 Fixing rpath for #{target.name}..."
        target.build_configurations.each do |config|
          # Ensure the framework can be found at runtime
          config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = [
            '$(inherited)',
            '@executable_path/Frameworks',
            '@loader_path/Frameworks'
          ]
        end
      end
    end
`;

      if (podfileContent.includes('post_install do |installer|')) {
        // Replace the entire post_install block to avoid duplication
        if (podfileContent.includes('# Square SDK fix injected')) {
          // If already injected, replace it with updated version
          const postInstallRegex = /post_install do \|installer\|(.*?)end/m;
          podfileContent = podfileContent.replace(postInstallRegex, 
            `post_install do |installer|${postInstallCode}  end`);
        } else {
          // Injects our fix at the top of your existing post_install block
          podfileContent = podfileContent.replace(
            'post_install do |installer|',
            `post_install do |installer|${postInstallCode}`
          );
        }
      } else {
        podfileContent += `\npost_install do |installer|\n${postInstallCode}\nend\n`;
      }

      // Add comment marker
      if (!podfileContent.includes('# Square SDK fix injected')) {
        podfileContent = podfileContent.replace(
          'post_install do |installer|',
          'post_install do |installer| # Square SDK fix injected'
        );
      }

      fs.writeFileSync(podfilePath, podfileContent);
      console.log('✅ Square SDK fix (cleanup + rpath) injected into Podfile');
      return config;
    },
  ]);
};