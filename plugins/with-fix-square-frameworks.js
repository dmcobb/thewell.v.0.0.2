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

      // Check if our fix is already injected
      if (podfileContent.includes('# Square SDK fix injected')) {
        console.log('✅ Square SDK fix already present in Podfile');
        return config;
      }

      // Clean Square SDK files and add rpath
      const postInstallCode = `
    installer.pods_project.targets.each do |target|
      if target.name.include?('SquareInAppPaymentsSDK') || target.name.include?('SquareBuyerVerificationSDK')
        puts "🔧 Cleaning Square SDK files from Pod: \#{target.name}"
        # Delete the 'setup' file that causes signature errors
        system("find \\"\#{installer.sandbox.root}\\" -name 'setup' -delete")
        # Delete the nested 'Frameworks' folder that causes bundle errors
        system("find \\"\#{installer.sandbox.root}\\" -name 'Frameworks' -type d -exec rm -rf {} +")
        
        # Add rpath for Square frameworks
        target.build_configurations.each do |config|
          config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = [
            '$(inherited)',
            '@executable_path/Frameworks',
            '@loader_path/Frameworks'
          ]
        end
      end
      
      # Add rpath for CorePaymentCard
      if target.name == 'CorePaymentCard'
        puts "🔧 Fixing rpath for \#{target.name}..."
        target.build_configurations.each do |config|
          config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = [
            '$(inherited)',
            '@executable_path/Frameworks',
            '@loader_path/Frameworks'
          ]
          config.build_settings['SKIP_INSTALL'] = 'NO'
          config.build_settings['INSTALL_PATH'] = '@rpath'
        end
      end
    end
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
      if (!podfileContent.includes('# Square SDK fix injected')) {
        podfileContent = podfileContent.replace(
          'post_install do |installer|',
          'post_install do |installer| # Square SDK fix injected'
        );
      }

      fs.writeFileSync(podfilePath, podfileContent);
      console.log('✅ Square SDK fixes injected into Podfile');
      return config;
    },
  ]);
};