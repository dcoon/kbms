const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const APP_VARIANT = {
    DEVELOPMENT: 'dev',
    PREVIEW: 'test',
};

const BASE_IDENTIFIER = 'io.github.dcoon.kbms';
const SHARING_EXTENSION_TARGET = 'expo-sharing-extension';

const getUniqueIdentifier = () => {
    if (IS_DEV) {
        const developmentIdentifier = `${BASE_IDENTIFIER}.${APP_VARIANT.DEVELOPMENT}`;
        console.log(`Building development variant with identifier: ${developmentIdentifier}`);
        return developmentIdentifier;
    }

    if (IS_PREVIEW) {
        return `${BASE_IDENTIFIER}.${APP_VARIANT.PREVIEW}`;
    }

    return BASE_IDENTIFIER;
};

const getAppName = () => {
    const baseName = 'KBMS';

    if (IS_DEV) {
        return `${baseName} (${APP_VARIANT.DEVELOPMENT})`;
    }

    if (IS_PREVIEW) {
        return `${baseName} (${APP_VARIANT.PREVIEW})`;
    }

    return baseName;
};

const getAppGroupIdentifier = () => `group.${getUniqueIdentifier()}`;

const getSharingExtensionBundleIdentifier = () => `${getUniqueIdentifier()}.${SHARING_EXTENSION_TARGET}`;

const getUpdatedAppExtensions = (existingExtensions = []) => {
    const updatedSharingExtension = {
        targetName: SHARING_EXTENSION_TARGET,
        bundleIdentifier: getSharingExtensionBundleIdentifier(),
        entitlements: {
            'com.apple.security.application-groups': [getAppGroupIdentifier()],
        },
    };

    let hasSharingExtension = false;

    const mergedExtensions = existingExtensions.map((extension) => {
        if (extension?.targetName === SHARING_EXTENSION_TARGET) {
            hasSharingExtension = true;
            return {
                ...extension,
                ...updatedSharingExtension,
            };
        }

        return extension;
    });

    if (!hasSharingExtension) {
        mergedExtensions.push(updatedSharingExtension);
    }

    return mergedExtensions;
};

export default ({ config }) => {
    const uniqueIdentifier = getUniqueIdentifier();
    const appGroupIdentifier = getAppGroupIdentifier();
    const existingExtensions = config?.extra?.eas?.build?.experimental?.ios?.appExtensions;

    return {
        ...config,
        name: getAppName(),
        ios: {
            ...config.ios,
            bundleIdentifier: uniqueIdentifier,
            entitlements: {
                ...config?.ios?.entitlements,
                'com.apple.security.application-groups': [appGroupIdentifier],
            },
        },
        android: {
            ...config.android,
            package: uniqueIdentifier,
        },
        extra: {
            ...config.extra,
            eas: {
                ...config?.extra?.eas,
                build: {
                    ...config?.extra?.eas?.build,
                    experimental: {
                        ...config?.extra?.eas?.build?.experimental,
                        ios: {
                            ...config?.extra?.eas?.build?.experimental?.ios,
                            appExtensions: getUpdatedAppExtensions(existingExtensions),
                        },
                    },
                },
            },
        },
    };
};
