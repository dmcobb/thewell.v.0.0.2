const { withProjectBuildPhase, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

console.log('🚀 [SQUARE-FIX] Plugin triggered for iOS 26');

module.exports = function withSquareFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
      if (!fs.existsSync(podfilePath)) return config;

      let content = fs.readFileSync(podfilePath, 'utf-8');

      // The script that goes into your Podfile
      const cleanupScript = `
    installer.aggregate_targets.each do |aggregate_target|
      aggregate_target.user_project.targets.each do |target|
        next unless target.product_type.include?('application')
        has_fix = target.shell_script_build_phases.any? { |p| p.name == 'Square Fix' }
        if !has_fix
          puts "🛠️ [SQUARE-FIX] INJECTING CLEANUP PHASE"
          phase = target.new_shell_script_build_phase('Square Fix')
          phase.shell_script = <<~EOT
            echo "🧹 [SQUARE-FIX] Deleting illegal files..."
            rm -v "$TARGET_BUILD_DIR/$FRAMEWORKS_FOLDER_PATH/SquareInAppPaymentsSDK.framework/setup" || true
            find "$TARGET_BUILD_DIR/$FRAMEWORKS_FOLDER_PATH" -name "Frameworks" -type d -print -exec rm -rf {} + || true
          EOT
        end
      end
    end`;

      if (!content.includes('Square Fix')) {
        // We look for the end of the post_install block and inject it there
        content = content.replace(
          /post_install do \|installer\|/,
          "post_install do |installer|\n" + cleanupScript
        );
        fs.writeFileSync(podfilePath, content);
        console.log('✅ [SQUARE-FIX] Podfile successfully modified.');
      }
      return config;
    },
  ]);
};