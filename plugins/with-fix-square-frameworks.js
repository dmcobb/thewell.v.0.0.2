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
      if (podfileContent.includes('# Square SDK + Hermes fix injected')) {
        console.log('✅ Square SDK + Hermes fix already present in Podfile');
        return config;
      }

      // Combined fix for Square SDK and Hermes
      const postInstallCode = `
    # Fix Hermes framework path
    def fix_hermes_path(installer)
      puts "🔧 Checking Hermes framework location..."
      
      # First, let's find where Hermes actually is
      hermes_paths = Dir.glob(File.join(installer.sandbox.root, '**', 'hermes.xcframework'))
      
      if hermes_paths.empty?
        puts "⚠️ Hermes.xcframework not found in Pods! This is a problem."
        return
      end
      
      puts "✅ Found Hermes at: \#{hermes_paths.first}"
      
      # Create the expected directory structure
      target_dir = File.join(installer.sandbox.root, 'hermes-engine', 'destroot', 'Library', 'Frameworks', 'universal')
      FileUtils.mkdir_p(target_dir)
      
      # Create symlink if needed
      expected_path = File.join(target_dir, 'hermes.xcframework')
      unless File.exist?(expected_path)
        puts "📋 Creating symlink to Hermes framework..."
        FileUtils.ln_sf(hermes_paths.first, expected_path)
      end
      
      # Also ensure the simulator slice exists
      simulator_slice = File.join(expected_path, 'ios-arm64_x86_64-simulator')
      if !Dir.exist?(simulator_slice)
        puts "⚠️ Simulator slice not found. This may cause issues for simulator builds."
      end
    end

    # Clean Square SDK files and add rpath
    installer.pods_project.targets.each do |target|
      if target.name.include?('SquareInAppPaymentsSDK') || target.name.include?('SquareBuyerVerificationSDK')
        puts "🔧 Cleaning Square SDK files from Pod: \#{target.name}"
        system("find \\"\#{installer.sandbox.root}\\" -name 'setup' -delete")
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

    # Fix Hermes path
    fix_hermes_path(installer)
`;

      // Inject the code into Podfile
      if (podfileContent.includes('post_install do |installer|')) {
        if (podfileContent.includes('# Square SDK + Hermes fix injected')) {
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
      if (!podfileContent.includes('# Square SDK + Hermes fix injected')) {
        podfileContent = podfileContent.replace(
          'post_install do |installer|',
          'post_install do |installer| # Square SDK + Hermes fix injected'
        );
      }

      fs.writeFileSync(podfilePath, podfileContent);
      console.log('✅ Square SDK + Hermes fixes injected into Podfile');
      return config;
    },
  ]);
};