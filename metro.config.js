const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// 配置 Metro 以支持 WASM 文件
config.resolver = config.resolver || {};
config.resolver.assetExts = config.resolver.assetExts || [];
config.resolver.assetExts.push('wasm');
config.resolver.assetExts.push('db');

// 扩展源扩展以包括 .wasm 文件
if (!config.resolver.sourceExts) {
  config.resolver.sourceExts = ['js', 'json', 'ts', 'tsx'];
}

module.exports = withNativeWind(config, { input: './global.css' });
