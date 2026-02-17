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

      // Combined fix for Square SDK and Hermes
      const postInstallCode = `
    # Fix Hermes framework path
    def fix_hermes_path(installer)
      hermes_path = File.join(installer.sandbox.root, 'hermes-engine', 'destroot', 'Library', 'Frameworks', 'universal', 'hermes.xcframework')
      if Dir.exist?(hermes_path)
        puts "✅ Found Hermes at: \#{hermes_path}"
      else
        puts "⚠️ Hermes not found at expected path, checking alternative locations..."
        # Try to find Hermes elsewhere
        find_hermes = \`find "\#{installer.sandbox.root}" -name "hermes.xcframework" -type d | head -1\`.strip
        if !find_hermes.empty?
          puts "✅ Found Hermes at: \#{find_hermes}"
          # Create symlink to expected location
          target_dir = File.join(installer.sandbox.root, 'hermes-engine', 'destroot', 'Library', 'Frameworks', 'universal')
          FileUtils.mkdir_p(target_dir)
          FileUtils.ln_sf(find_hermes, File.join(target_dir, 'hermes.xcframework'))
          puts "✅ Created symlink to Hermes framework"
        end
      end
    end

    # Clean Square SDK files
    installer.pods_project.targets.each do |target|
      if target.name.include?('SquareInAppPaymentsSDK') || target.name.include?('SquareBuyerVerificationSDK')
        puts "Cleaning Square SDK files from Pod: \#{target.name}"
        system("find \\"\#{installer.sandbox.root}\\" -name 'setup' -delete")
        system("find \\"\#{installer.sandbox.root}\\" -name 'Frameworks' -type d -exec rm -rf {} +")
      end
      
      # Add rpath fix
      if target.name == 'CorePaymentCard' || target.name.include?('Square')
        puts "🔧 Fixing rpath for \#{target.name}..."
        target.build_configurations.each do |config|
          config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = [
            '$(inherited)',
            '@executable_path/Frameworks',
            '@loader_path/Frameworks'
          ]
        end
      end
    end

    # Fix Hermes path
    fix_hermes_path(installer)
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
      console.log('✅ Square SDK + Hermes fixes injected into Podfile');
      return config;
    },
  ]);
};