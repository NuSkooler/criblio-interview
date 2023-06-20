import express from 'express';
import {
  list as listDevices,
  register as registerDevice,
  listLogs,
  readLogLines,
} from '../controllers/devices';

const routes = express.Router();

routes.get('/', listDevices);
routes.post('/', registerDevice);

routes.get('/:deviceId/logs', listLogs);
routes.get('/:deviceId/logLines', readLogLines);

export default routes;
