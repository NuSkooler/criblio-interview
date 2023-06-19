import os from 'os';
import { v5 as uuidv5 } from 'uuid';

const DeviceIdNamespace = 'bd4ee106-ca87-4e21-a7a4-20a8ada4e7f6';

export interface DeviceInfo {
  id: string;
  name: string;
  type: string;
  machine: string;
  remoteAddress?: string;
}

/**
 *
 * Fetches information about the current device.
 *
 * @returns `DeviceInfo`
 *
 */
export const getDeviceInfo = (): DeviceInfo => {
  const id = uuidv5(
    `${os.cpus().length}${os.arch()}${os.platform()}${os.hostname()}`,
    DeviceIdNamespace
  );
  return { id, name: os.hostname(), type: os.type(), machine: os.machine() };
};
