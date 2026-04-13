const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = (config) => {
  return withAppBuildGradle(config, (config) => {
    console.log('--- withJavaToolchain: modifying build.gradle ---');

    const toolchainBlock = `
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}
`;

    // Check if it's already there to prevent duplicates
    if (config.modResults.contents.includes('JavaLanguageVersion.of(17)')) {
      console.log('Toolchain already present, skipping...');
      return config;
    }

    // Append to the very end of the file
    config.modResults.contents += toolchainBlock;
    
    console.log('Toolchain successfully appended to build.gradle');
    return config;
  });
};