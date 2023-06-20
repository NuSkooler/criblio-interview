# Cribl Interview Project

A "homework" interview project for [Cribl](https://cribl.io/)!

# Quick Start

```bash
# install
cd criblio-interview
npm install
npm start
```

:information_source: The system must be run with root permissions in order to access most files within `/var/log`!

Maybe try out some queries! Example using [httpie](https://httpie.io/):

```bash
# Discover devices
http get 'http://localhost:8080/devices/'

# List available logs on device "a74c3a93-6eee-5f91-80a8-07ee31d0c253"
http get 'http://localhost:8080/devices/a74c3a93-6eee-5f91-80a8-07ee31d0c253/logs'

# Fetch some log lines from a device/log tuple
http get 'http://localhost:8080/devices/a74c3a93-6eee-5f91-80a8-07ee31d0c253/logLines?file=vmware-network.log&count=42
```

## Testing

```bash
npm test
```

# For Developers

## Installation

1. Git clone this project
2. `npm install`

## Configuration

A configuration file, `config.json` can be used to override some defaults. The following example shows keys that may be overridden:

```json
{
  "mode": "FOLLOWER",
  "port": 1234,
  "host": "0.0.0.0",
  "logLocation": "/var/foo/log"
}
```

## Docs

See [Documentation](./docs/index.md) for additional information.

## Missing Functionality

A number of items are _not_ implemented, including:

- AuthZ/AuthN
- TLS
- A number of quickly hand rolled methods such as HTTP requests need to handle edge cases
- Logging
- Additional testing that I don't yet have time to implement

Additionally, a number of optimizations could be performed such as caching:
Perhaps a LRU of recently fetched log files per device. Keep a open fd and implement a fs watch
on the particular log with a window of of the last _N_ entries and ending position. Requests
on these logs and within the window require no additional IO; requests larger than the window
need only read from the known position and back.

# License

See [LICENSE.TXT](LICENSE.TXT).
