import { AppConfig, getAppConfig } from './app';

export interface Config {
  app: AppConfig;
}

let globalConfig: Config;

/**
 * Initializes all configurations.
 *
 * @returns A populated `Config`
 *
 * @remarks After initialization, all configuration is available via `getConfig()`
 */
const init = (): Config => {
  globalConfig = { app: getAppConfig() };
  return globalConfig;
};

export const getConfig = (): Config => {
  return globalConfig;
};

export const setConfig = (config: Config): void => {
  globalConfig = config;
};

export default init;
