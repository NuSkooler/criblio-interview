import * as fs from 'fs';
import * as path from 'path';

export enum Mode {
  LEADER = 'LEADER',
  FOLLOWER = 'FOLLOWER',
}

export interface AppConfig {
  mode: Mode;
  host?: string;
  port?: number;
  logLocation?: string;
  leaderHost?: string;
  leaderPort?: number;
  deviceId?: string;
}

export const DefaultListenHost = 'localhost';
export const DefaultListenPort = 8080;

const DefaultLogLocation = '/var/log/';

/**
 * Loads the main application configuration, if any.
 *
 * @returns A valid `AppConfig`
 */
export const getAppConfig = (): AppConfig => {
  let config: string;

  try {
    const configPath = process.argv[2] || path.join(__dirname, '../../config.json');
    config = fs.readFileSync(configPath, {
      encoding: 'utf8',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e.code !== 'ENOENT') {
      throw new Error(e);
    }
    return { mode: Mode.LEADER };
  }

  let parsed: AppConfig;
  try {
    parsed = JSON.parse(config) as AppConfig;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error('Invalid config.json');
  }

  if (parsed.mode !== Mode.LEADER && parsed.mode !== Mode.FOLLOWER) {
    throw new Error('"mode" must be LEADER or FOLLOWER');
  }

  if (parsed.port && typeof parsed.port !== 'number') {
    throw new Error('"port" must be a number');
  }

  if (parsed.host && typeof parsed.host !== 'string') {
    throw new Error('"host" must be a string');
  }

  if (parsed.logLocation && typeof parsed.logLocation !== 'string') {
    throw new Error('"logLocation" must be a string');
  }

  if (parsed.deviceId && typeof parsed.deviceId !== 'string') {
    throw new Error('"deviceId" must be a string');
  }

  if (parsed.mode === Mode.FOLLOWER) {
    if (!parsed.leaderHost || typeof parsed.leaderHost !== 'string') {
      throw new Error('FOLLOWER mode requires "leaderHost" string');
    }
    if (!parsed.leaderPort || typeof parsed.leaderPort !== 'number') {
      throw new Error('FOLLOWER mode requires "leaderPort" number');
    }
  }

  return {
    mode: Mode[parsed.mode],
    host: parsed.host,
    port: parsed.port,
    leaderHost: parsed.leaderHost,
    leaderPort: parsed.leaderPort,
    logLocation: parsed.logLocation || DefaultLogLocation,
    deviceId: parsed.deviceId,
  };
};
