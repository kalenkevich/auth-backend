import lodash from 'lodash';
import { Container } from 'typedi';
import DefaultSettings from './default';
import LocalSettings from './local';
import DevSettings from './development';
import StageSettings from './staging';
import ProdSettings from './production';

export const ENVIRONMENTS = {
    LOCAL: 'local',
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
};

export const getEnvSettings = (env: string) => {
    switch (env) {
        case ENVIRONMENTS.LOCAL: return LocalSettings;
        case ENVIRONMENTS.DEVELOPMENT: return DevSettings;
        case ENVIRONMENTS.STAGING: return StageSettings;
        case ENVIRONMENTS.PRODUCTION: return ProdSettings;
        default: return LocalSettings;
    }
};

export const getParseValue = (val: string) => {
    if (lodash.isFinite(+val)) {
        return +val;
    }

    if (val === 'true') {
        return true;
    }

    if (val === 'false') {
        return false;
    }

    return val;
};

export const getObjectFromProcessEnv = (processEnv: any) =>
    Object.keys(processEnv || {}).reduce((config, key: string) => {
        lodash.set(config, key, getParseValue(processEnv[key]));

        return config;
    }, {});

export const currentEnv = process.env.ENVIRONMENT;

export const currentProcessEnv = process.env;

export const ResultSettings = {
    ...DefaultSettings,
    ...getEnvSettings(currentEnv),
    ...getObjectFromProcessEnv(currentProcessEnv),
};

Container.set('settings', ResultSettings);

export default ResultSettings;

