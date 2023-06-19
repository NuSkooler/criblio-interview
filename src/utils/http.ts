import http from 'http';

export const httpRequestJson = (url): Promise<object> => {
  return new Promise((resolve, reject) => {
    const req = http.get(url, res => {
      const bodyData = [];
      res.on('data', d => {
        bodyData.push(d);
      });

      res.on('end', () => {
        const body = Buffer.concat(bodyData).toString();

        if (res.statusCode < 200 || res.statusCode > 299) {
          return reject(new Error(`Bad status code: ${res.statusCode}`));
        }

        try {
          const json = JSON.parse(body);
          return resolve(json);
        } catch (e) {
          return reject(e);
        }
      });
    });

    req.on('error', err => {
      return reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
    });

    req.end();
  });
};
