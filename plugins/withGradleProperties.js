// plugins/withGradleNoParallel.js
const { withGradleProperties } = require('@expo/config-plugins');

module.exports = (config) => {
  // CRITICAL: You must return the result of withGradleProperties
  return withGradleProperties(config, (config) => {
    config.modResults.push(
      { type: 'property', key: 'org.gradle.console', value: 'plain' },
      { type: 'property', key: 'org.gradle.parallel', value: 'false' },
      { type: 'property', key: 'org.gradle.logging.level', value: 'info' }
    );
    // CRITICAL: The inner function must also return config
    return config;
  });
};
