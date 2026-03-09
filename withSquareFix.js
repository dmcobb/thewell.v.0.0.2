const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withSquareFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
      if (!fs.existsSync(podfilePath)) return config;

      let content = fs.readFileSync(podfilePath, 'utf-8');

      // We use the exact structure you had, but improve the SHELL script inside
      const cleanupScript = `
    installer.aggregate_targets.each do |aggregate_target|
      aggregate_target.user_project.targets.each do |target|
        next unless target.product_type.include?('application')
        has_fix = target.shell_script_build_phases.any? { |p| p.name == 'Square Fix' }
        if !has_fix
          puts "🛠️ [SQUARE-FIX] INJECTING LATE-PHASE CLEANUP"
          phase = target.new_shell_script_build_phase('Square Fix')
          # This EOT block is what Xcode will run at the end of the ARCHIVE
          phase.shell_script = <<~EOT
            echo "🧹 [SQUARE-FIX] Cleaning disallowed files..."
            # Use the environment variable to find the final bundle
            FINAL_PATH="$TARGET_BUILD_DIR/$FRAMEWORKS_FOLDER_PATH"
            
            # Delete the setup files
            find "$FINAL_PATH" -name "setup" -print -delete || true
            
            # Delete nested Frameworks
            find "$FINAL_PATH" -name "Frameworks" -type d -mindepth 2 -print -exec rm -rf {} + || true
          EOT
        end
      end
    end`;

      if (!content.includes('Square Fix')) {
        content = content.replace(
          /post_install do \|installer\|/,
          "post_install do |installer|\n" + cleanupScript
        );
        fs.writeFileSync(podfilePath, content);
      }
      return config;
    },
  ]);
};