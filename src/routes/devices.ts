import express from 'express';
import { list as listDevices, listLogs, readLogLines } from '../controllers/devices';

const routes = express.Router();

routes.get('/', listDevices);

routes.get('/:deviceId/logs', listLogs);
routes.get('/:deviceId/logLines', readLogLines);

export default routes;
