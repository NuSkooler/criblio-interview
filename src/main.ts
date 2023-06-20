import express from 'express';
import { DefaultListenHost, DefaultListenPort } from './configs/app';
import initConfig from './configs/init';
import { Mode } from './configs/app';
import http from 'http';
import { AddressInfo } from 'net';
import routes from './routes';
import bodyParser from 'body-parser';
import { getDeviceInfo } from './utils/device';

import axios from 'axios';
import { registerDevice } from './models/devices';

/**
 * Creates the main Express REST server.
 */
const createServer = (): void => {
  const config = initConfig();
  const app = express();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.disable('x-powered-by');

  app.use('/v1', routes);

  const host = config.app.host || DefaultListenHost;
  const port = config.app.port || DefaultListenPort;

  // register our local device
  const localDeviceInfo = getDeviceInfo();
  registerDevice(localDeviceInfo);

  const server = http.createServer(app).listen({ host, port }, () => {
    const addr = server.address() as AddressInfo;
    console.info(`Server listening at http://${addr.address}:${addr.port}`);

    if (config.app.mode === Mode.FOLLOWER) {
      const thisAddress = `${host}:${port}`;
      const registerDeviceInfo = getDeviceInfo(thisAddress);
      const registerUrl = `http://${config.app.leaderHost}:${config.app.leaderPort}/v1/devices`;
      axios
        .post(registerUrl, registerDeviceInfo)
        .then(() => {
          console.info('Registered with LEADER');
        })
        .catch(err => {
          console.error(`Cannot attach to FOLLOWER: ${err.message}`);
          server.close();
        });
    }
  });

  ['SIGTERM', 'SIGINT', 'SIGUSR2'].forEach(sig => {
    process.once(sig, () => {
      console.info(`Encountered ${sig}; Shutting down...`);
      server.close(() => {
        console.info('Goodbye!');
      });
    });
  });
};

createServer();
