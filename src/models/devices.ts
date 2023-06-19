import { DeviceInfo, getDeviceInfo } from '../utils/device';

export type RegisteredDevices = Map<string, DeviceInfo>;

const localDeviceInfo = getDeviceInfo();

const registeredDevices: RegisteredDevices = new Map([
  [localDeviceInfo.id, localDeviceInfo],
]);

export const getRegisteredDevices = (): RegisteredDevices => {
  return registeredDevices;
};
