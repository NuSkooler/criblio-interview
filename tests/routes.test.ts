import request from 'supertest';
import express from 'express';
import routes from '../src/routes';
import bodyParser from 'body-parser';
import { getDeviceInfo, DeviceInfo } from '../src/utils/device';
import { registerDevice } from '../src/models/devices';
import { setConfig } from '../src/configs/init';
import { Mode } from '../src/configs/app';
import path from 'path';
import fs from 'fs';
import { tmpdir } from 'os';

const app = express();
app.use('/', routes);
app.use(bodyParser.json());

let tempDir: string;
let localDeviceInfo: DeviceInfo;

beforeAll(() => {
  tempDir = fs.mkdtempSync(path.join(tmpdir(), 'cribl.io'));

  localDeviceInfo = getDeviceInfo();
  registerDevice(localDeviceInfo);

  setConfig({
    app: { mode: Mode.LEADER, logLocation: tempDir },
  });

  const mkData = (f: string, d: string): void => {
    fs.writeFileSync(path.join(tempDir, f), d, { encoding: 'utf-8' });
  };

  mkData('some.log.file.log', 'This\r\nis\na funky\r\nlog file\n');
});

afterAll(() => {
  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true });
  }
});

describe('routes should respond properly', () => {
  test('health check is successful', async () => {
    const res = await request(app).get('/health');
    expect(res.header['content-type']).toBe('application/json; charset=utf-8');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  test('devices list returns local info', async () => {
    const res = await request(app).get('/devices');
    expect(res.header['content-type']).toBe('application/json; charset=utf-8');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: [localDeviceInfo] });
  });

  test('list device logs succeeds', async () => {
    const res = await request(app).get(`/devices/${localDeviceInfo.id}/logs`);
    expect(res.header['content-type']).toBe('application/json; charset=utf-8');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: ['some.log.file.log'] });
  });

  test('get device log succeeds', async () => {
    const res = await request(app).get(
      `/devices/${localDeviceInfo.id}/logLines?filename=some.log.file.log`
    );
    expect(res.header['content-type']).toBe('application/json; charset=utf-8');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: ['log file', 'a funky', 'is', 'This'],
    });
  });
});
