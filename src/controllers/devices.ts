import { getRegisteredDevices, registerDevice } from '../models/devices';
import { DeviceInfo } from '../utils/device';
import {
  resourceNotFound,
  invalidRequest,
  forbidden,
  internalError,
} from '../utils/response';
import { listEntries, readLines } from '../utils/logs';
import { Dirent } from 'fs';
import axios from 'axios';

/**
 *
 * Lists known devices
 *
 */
export const list = (_req, res): void => {
  res
    .status(200)
    .json({ success: true, data: Array.from(getRegisteredDevices().values()) });
};

export const register = (req, res): void => {
  const device = req.body as DeviceInfo;

  registerDevice(device);

  res.status(200).json({ success: true });
};

interface LogResponse {
  status: boolean;
  data: Array<string>;
}

const getDevice = (deviceId): DeviceInfo => {
  const allDevices = getRegisteredDevices();
  return allDevices.get(deviceId);
};

export const listLogs = async (req, res): Promise<void> => {
  const device = getDevice(req.params.deviceId);
  if (!device) {
    return resourceNotFound(res);
  }

  if (device.remoteAddress) {
    const remoteUrl = `http://${device.remoteAddress}/v1/devices/${device.id}/logs`;
    try {
      const remoteRes = await axios.get(remoteUrl);
      const logResponse = remoteRes.data as LogResponse;

      res.status(200).json(logResponse);
    } catch (e) {
      internalError(res);
    }

    return;
  }

  try {
    const logsEntries = await listEntries();
    res
      .status(200)
      .json({ success: true, data: logsEntries.map((entry: Dirent) => entry.name) });
  } catch (e) {
    internalError(res);
  }
};

export const readLogLines = async (req, res): Promise<void> => {
  if (typeof req.query.filename !== 'string') {
    return invalidRequest(res, 'Missing "filename" query parameter');
  }

  if (req.query.filter && typeof req.query.filter !== 'string') {
    return invalidRequest(res, 'Query param "filter" string');
  }

  const device = getDevice(req.params.deviceId);
  if (!device) {
    return resourceNotFound(res);
  }

  //  :TODO: handle follower
  const count = parseInt(req.query.count);

  try {
    const lines = await readLines(
      req.query.filename,
      isNaN(count) ? Number.MAX_SAFE_INTEGER : count,
      req.query.filter
    );
    res.status(200).json({ success: true, data: lines });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e.code === 'EACCES') {
      return forbidden(res);
    }

    internalError(res);
  }
};
