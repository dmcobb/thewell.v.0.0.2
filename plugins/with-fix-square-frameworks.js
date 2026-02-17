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
      if (podfileContent.includes('# Square SDK and CorePaymentCard fixes')) {
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

      // Post_install code that prepares frameworks for your script
      const postInstallCode = `
    puts "🔧 Preparing Square SDK frameworks for post-build cleanup..."
    
    # Configure CorePaymentCard as dynamic framework (for your script to find it)
    installer.pods_project.targets.each do |target|
      if target.name == 'CorePaymentCard'
        puts "✅ Configuring CorePaymentCard as dynamic framework..."
        target.build_configurations.each do |config|
          config.build_settings['MACH_O_TYPE'] = 'mh_dylib'
          config.build_settings['SKIP_INSTALL'] = 'NO'
          config.build_settings['INSTALL_PATH'] = '@rpath'
          config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = [
            '$(inherited)',
            '@executable_path/Frameworks',
            '@loader_path/Frameworks'
          ]
        end
      end
    end

    # IMPORTANT: Clean the SOURCE frameworks before they get built
    # This prevents the nested Frameworks folders and setup files from being included
    puts "🔧 Removing nested Frameworks folders and setup files from Square SDK source..."
    
    # Find and clean all Square SDK frameworks in Pods
    Dir.glob("\#{installer.sandbox.root}/*Square*SDK*").each do |framework_dir|
      if File.directory?(framework_dir)
        # Remove nested Frameworks folders
        nested_frameworks = File.join(framework_dir, 'Frameworks')
        if File.directory?(nested_frameworks)
          FileUtils.rm_rf(nested_frameworks)
          puts "  Removed nested Frameworks from \#{File.basename(framework_dir)}"
        end
        
        # Remove setup file
        setup_file = File.join(framework_dir, 'setup')
        if File.file?(setup_file)
          FileUtils.rm_f(setup_file)
          puts "  Removed setup file from \#{File.basename(framework_dir)}"
        end
      end
    end
    
    # Also clean any Frameworks folders inside .frameworks
    system("find \\"\#{installer.sandbox.root}\\" -name 'Frameworks' -type d -exec rm -rf {} + 2>/dev/null || true")
    system("find \\"\#{installer.sandbox.root}\\" -name 'setup' -type f -delete 2>/dev/null || true")
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
        'post_install do |installer| # Square SDK and CorePaymentCard fixes'
      );

      fs.writeFileSync(podfilePath, podfileContent);
      console.log('✅ Square SDK source frameworks cleaned (nested Frameworks and setup files removed)');
      console.log('✅ CorePaymentCard configured as dynamic framework');
      console.log('✅ Your fix-square-payments.js script will still copy and sign CorePaymentCard after build');
      
      return config;
    },
  ]);
};