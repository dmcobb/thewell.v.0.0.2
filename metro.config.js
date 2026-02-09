const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")
const path = require('path')

const config = getDefaultConfig(__dirname)

// Force metro to use the correct entry point
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-square-in-app-payments') {
    const resolvedPath = require.resolve(
      'react-native-square-in-app-payments/src/index.ts',
      { paths: [context.originModulePath] }
    );
    return {
      filePath: resolvedPath,
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Alternative: Use extraNodeModules
config.resolver.extraNodeModules = {
  'react-native-square-in-app-payments': path.join(
    __dirname, 
    'node_modules/react-native-square-in-app-payments/src/index.ts'
  ),
}

module.exports = withNativeWind(config, { input: "./global.css" })
