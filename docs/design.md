# General Design

This project demonstrates a fairly [KISS](https://en.wikipedia.org/wiki/KISS_principle) REST service with minimal dependencies required for Express and TypeScript. Services run as either a **leader** (that clients talk directly to) or a **follower** (in which requests are forwarded to). Followers register with the leader by way of a entry in their `config.json`. This of course means the leader must be started first, and there is not currently any failover, discovery, etc.

- Each machine the service runs on is known as a `device` and has a UUID _device ID_.
- A given device has discoverable logs.
- Each log may be queried by filename.

There are **many** drawbacks to this simple design. A more mature system would perhaps utilize leader election, allow for HA, etc.

## Components

- [Express](https://expressjs.com/) for web handling
- [Jest](https://jestjs.io/) for unit testing
- [Winston](https://github.com/winstonjs/winston) for logging
- [Prettier](https://prettier.io/) for code formatting
