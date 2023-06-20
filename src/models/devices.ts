import { DeviceInfo } from '../utils/device';

export type RegisteredDevices = Map<string, DeviceInfo>;

const registeredDevices: RegisteredDevices = new Map<string, DeviceInfo>();

export const getRegisteredDevices = (): RegisteredDevices => {
  return registeredDevices;
};

export const registerDevice = (device: DeviceInfo): void => {
  registeredDevices.set(device.id, device);
};
