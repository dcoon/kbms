export default ({ config }) => ({
  ...config,
  name: getAppName(),
  ios: {
    ...config.ios,
    bundleIdentifier: getUniqueIdentifier(),
  },
  android: {
    ...config.android,
    package: getUniqueIdentifier(),
  },
});


const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

    const AppVariant = {
        Development: 'dev',
        Preview: 'test',
        Production: '',
    };


const getUniqueIdentifier = () => {
    const baseIdentifier = 'io.github.dcoon.kbms';

    if (IS_DEV) {
        console.log(`Building development variant with identifier: ${baseIdentifier}.${AppVariant.Development}`);
        return `${baseIdentifier}.${AppVariant.Development}`;
    }

    if (IS_PREVIEW) {
        return `${baseIdentifier}.${AppVariant.Preview}`;
    }

    return baseIdentifier;
};

const getAppName = () => {

    const baseName = 'KBMS';


    if (IS_DEV) {
        return `${baseName} (${AppVariant.Development})`;
    }

    if (IS_PREVIEW) {
        return `${baseName} (${AppVariant.Preview})`;
    }

    return `${baseName}`;
};
