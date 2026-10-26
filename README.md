# Healthchecks.io Client for OpenWrt

A small [Healthchecks.io](https://healthchecks.io/) heartbeat client for OpenWrt routers, with an optional LuCI page.

This is a hardened fork of [mysterious1der/router-pings](https://github.com/mysterious1der/router-pings) for OpenWrt 25.12 and newer (apk package manager).

## Features

- Pings your Healthchecks.io check every 1 to 1440 minutes
- HTTPS only, with certificate verification (`uclient-fetch` + `ca-bundle`)
- Runs as the unprivileged system user `healthchecks`, not as root
- Quiet log: one line at start, one when pings start failing, one when they recover, and a reminder every 12 hours while they keep failing
- Settings are checked before the service starts; invalid settings are refused with one clear log line
- LuCI page (JavaScript, no Lua) with input validation; Save & Apply restarts the service
- Architecture-independent (`noarch`)

## Requirements

- OpenWrt 25.12 or newer. Tested on OpenWrt 25.12.5; older releases are untested.
- `uclient-fetch`, `ca-bundle` and a TLS library for `uclient-fetch` (`libustream-mbedtls`), all part of standard images
- `luci-base` for the web page (optional)

## Installation

### From a GitHub release

Download both packages from the [releases page](https://github.com/InvalidWaypoint/router-pings/releases), check them against the SHA-256 checksums in the release notes, and install:

```sh
cd /tmp
wget -O healthchecks-0.2.0-r1.apk https://github.com/InvalidWaypoint/router-pings/releases/download/v0.2.0/healthchecks-0.2.0-r1.apk
wget -O luci-app-healthchecks-0.2.0-r1.apk https://github.com/InvalidWaypoint/router-pings/releases/download/v0.2.0/luci-app-healthchecks-0.2.0-r1.apk
sha256sum healthchecks-0.2.0-r1.apk luci-app-healthchecks-0.2.0-r1.apk

apk add --allow-untrusted ./healthchecks-0.2.0-r1.apk ./luci-app-healthchecks-0.2.0-r1.apk
```

`--allow-untrusted` is needed because the packages are not signed with an OpenWrt key. The service is installed disabled; it starts once you enable it (see below).

### Build from source

Use an OpenWrt 25.12 SDK for any target (the packages are architecture-independent), for example the official Docker image:

```sh
git clone https://github.com/InvalidWaypoint/router-pings.git
docker run --rm -it -v "$PWD/router-pings:/src:ro" openwrt/sdk:mediatek-filogic-v25.12.5 bash

# inside the container
cp -r /src/healthchecks /src/luci-app-healthchecks package/
./scripts/feeds update base luci
./scripts/feeds install uclient-fetch ca-bundle luci-base
make defconfig
make package/healthchecks/compile package/luci-app-healthchecks/compile
ls bin/packages/*/base/*healthchecks*
```

The feeds are needed so the dependencies are recorded in the packages. The first build takes a while because the SDK also builds `luci-base` and its dependencies.

## Configuration

### LuCI

Go to **Services → Healthchecks.io**, set the ping URL, tick **Enabled** and click **Save & Apply**.

### Command line

```sh
uci set healthchecks.main.url='https://hc-ping.com/your-uuid-here'
uci set healthchecks.main.interval_minutes='5'
uci set healthchecks.main.enabled='1'
uci commit healthchecks
/etc/init.d/healthchecks restart
```

| Option | Default | Allowed values |
|---|---|---|
| `enabled` | `0` | `0` or `1` |
| `url` | empty | `https://` URL made of letters, digits and `. _ ~ : / ? = & % + -` |
| `interval_minutes` | `5` | whole number from 1 to 1440 |
| `verbose` | `0` | `1` logs every ping (for troubleshooting) |

### Service control

```sh
/etc/init.d/healthchecks start|stop|restart
/etc/init.d/healthchecks enable|disable   # start at boot or not
```

With `enabled '0'` the service runs nothing and logs nothing.

## Logging

```sh
logread -e healthchecks
```

Typical lines:

```
daemon.info healthchecks: Started: pinging hc-ping.com every 5 min
daemon.warn healthchecks: Ping to hc-ping.com failed: HTTP error 500
daemon.warn healthchecks: Ping to hc-ping.com still failing after 145 attempts (about 12h): HTTP error 500
daemon.notice healthchecks: Ping to hc-ping.com OK again after 300 failed attempt(s)
daemon.err healthchecks: Not started: ping URL must start with https://
```

Only the host name is logged, never the full ping URL.

## Security notes

- The ping URL is a secret: anyone who has it can report your check as up or down. `/etc/config/healthchecks` is readable by root only, the URL reaches the worker through its environment (readable only by the `healthchecks` user) and it is never logged. It is visible in the process list for the second or so each ping takes.
- The worker runs as the system user `healthchecks`, created when the package is installed.
- Pings use HTTPS with certificate verification. The service refuses to start without CA certificates in `/etc/ssl/certs`.
- The LuCI page can read and write the `healthchecks` config only. It has no permission to run commands.

## Updating

Install the newer packages the same way (`apk add --allow-untrusted ./<new>.apk ...`). The service restarts on the new version and your settings are kept. If you had changed them, the new default config is written next to yours as `/etc/config/healthchecks.apk-new`, which you can delete.

## Firmware upgrades

These packages are installed from local files, not from the OpenWrt package feeds, so a firmware upgrade (sysupgrade or Attended Sysupgrade) does not bring them back. Reinstall both packages after an upgrade and check that `/etc/config/healthchecks` is still there.

## Uninstallation

```sh
apk del luci-app-healthchecks healthchecks
```

Like other OpenWrt packages, this keeps your `/etc/config/healthchecks` (it contains your ping URL) and the `healthchecks` system user. To remove them as well:

```sh
rm /etc/config/healthchecks
sed -i '/^healthchecks:/d' /etc/passwd /etc/shadow /etc/group
```

## Troubleshooting

- **No log line after enabling:** check `uci get healthchecks.main.enabled` and restart the service.
- **`Not started: ...`:** fix the setting named in the message and restart.
- **Test the URL by hand:** `uclient-fetch -O /dev/null "$(uci get healthchecks.main.url)"`. This prints the full URL, so don't paste the output anywhere public.
- **LuCI menu entry missing:** `rm -f /tmp/luci-indexcache.*; /etc/init.d/rpcd reload`, then reload the page.

## How it works

1. `/etc/init.d/healthchecks` reads and checks the settings, then starts `/usr/bin/healthchecks-ping` under procd as the user `healthchecks`. procd restarts it when `/etc/config/healthchecks` changes.
2. The worker sends an HTTPS GET to the ping URL (30 second timeout), waits for the interval and repeats.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Created by Jirah Cox. Hardened for OpenWrt 25.12 in this fork.

Healthchecks.io is a service by [Healthchecks.io](https://healthchecks.io/).
