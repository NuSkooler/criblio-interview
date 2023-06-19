import express from 'express';

import { resourceNotFound } from '../utils/response';
import devices from './devices';

const routes = express.Router();

routes.get('/health', (_req, res) => {
  res.status(200).json({ success: true });
});

routes.use('/devices', devices);

routes.use((_req, res) => {
  return resourceNotFound(res);
});

export default routes;
