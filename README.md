# Cribl Interview Project

A "homework" interview project for [Cribl](https://cribl.io/)!

# Quick Start

```bash
# install
cd criblio-interview
npm install
npm start

# test
npm test
```

:information_source: The system must be run with root permissions in order to access most files within `/var/log`!

# For Developers

## Installation

1. Git clone this project
2. `npm install`

## Configuration

- TODO leader vs follower
- TODO config.json

## Docs

See [Documentation](./docs/index.md) for additional information.

## Missing Functionality

A number of items are _not_ implemented, including:

- Authentication
- TLS
- Additional types / type checking, interfaces on request/responses, etc.
- A number of quickly hand rolled methods such as HTTP requests need to handle edge cases

Additionally, a number of optimizations could be performed such as caching:
Perhaps a LRU of recently fetched log files per device. Keep a open fd and implement a fs watch
on the particular log with a window of of the last _N_ entries and ending position. Requests
on these logs and within the window require no additional IO; requests larger than the window
need only read from the known position and back.

# License

See [LICENSE.TXT](LICENSE.TXT).
