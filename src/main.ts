import express from 'express';
import { DefaultListenHost, DefaultListenPort } from './configs/app';
import initConfig from './configs/init';
import http from 'http';
import { AddressInfo } from 'net';
import routes from './routes';

/**
 * Creates the main Express REST server.
 */
const createServer = (): void => {
  const config = initConfig();
  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.disable('x-powered-by');

  app.use('/', routes);

  const host = config.app.host || DefaultListenHost;
  const port = config.app.port || DefaultListenPort;

  const server = http.createServer(app).listen({ host, port }, () => {
    const addr = server.address() as AddressInfo;
    console.info(`Server listening at http://${addr.address}:${addr.port}`);
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
