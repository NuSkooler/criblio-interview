# Testing

## Leader and Follower

To simulate a leader and follower locally, create two configurations:

**leader-config.json**

```json
{
  "mode": "LEADER"
}
```

**follower-config.json**

```json
{
  "mode": "FOLLOWER",
  "port": 8081,
  "host": "localhost",
  "leaderHost": "localhost",
  "leaderPort": 8080,
  "deviceId": "4899008a-1024-4a2a-ab57-eecfcb11b744"
}
```

:information_source: Note that the follower configuration "points" to the leader, and has an explicitly assigned device ID to ensure it does not conflict with the leader on the same machine.

```bash
# terminal 1: leader
npm start ./leader-config.json

# terminal 2: follower
npm start ./follower-config.json
```

You can now query devices from the leader and see both devices listed. Additionally the leader will forward requests to the follower for the device ID "4899008a-1024-4a2a-ab57-eecfcb11b744".
