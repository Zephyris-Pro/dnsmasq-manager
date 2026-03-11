# DNSMasq Manager

A modern web interface to easily manage your custom DNS records via [dnsmasq](https://dnsmasq.org/), without ever editing a config file by hand.

- [Quick Setup](#quick-setup)
- [Full Documentation](https://zephyris-pro.github.io/dnsmasq-manager/setup/)
- [User Guide](https://zephyris-pro.github.io/dnsmasq-manager/guide/)

## Features

- **Modern web interface** based on [Tabler](https://tabler.github.io/) with dark/light mode
- **DNS record management** - create, enable/disable and delete A, AAAA, CNAME and TXT records
- **Upstream DNS servers** - configure upstream resolvers (Cloudflare, Google DNS, etc.) from the UI
- **Automatic reload** - dnsmasq restarts automatically via the Docker API after each change
- **JWT authentication** with mandatory password change on first login
- **Multi-language** - English, Italian and French supported
- **Docker ready** - single `docker compose up -d` gets everything running

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React + TypeScript + Vite + Tabler  |
| Backend   | Node.js + Express                   |
| DNS       | dnsmasq                             |
| Deploy    | Docker + Docker Compose             |

## Quick Setup

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Port **53** (DNS) and **82** (Web UI) available

### 1. Clone the repository

```bash
git clone https://github.com/Zephyris-Pro/dnsmasq-manager.git
cd dnsmasq-manager
```

### 2. Start the services

```bash
cd docker
docker compose up -d
```

This will build and start:
- **dnsmasq** on port `53` (UDP/TCP)
- **Web UI** on port `82`

### 3. Log in

Open [http://localhost:82](http://localhost:82) in your browser.

Default credentials:
- **Email**: `admin@example.com`
- **Password**: `changeme`

> You will be prompted to change your password on first login.

## Data Files

All persistent data is stored in the `data/` directory:

```
data/
├── dnsmasq.conf   # dnsmasq configuration
├── hosts          # custom DNS records
└── users.json     # user database
```

## Contributing

Pull requests are welcome on the `main` branch.

## Getting Support

- [Report a bug](https://github.com/Zephyris-Pro/dnsmasq-manager/issues)
- [Discussions](https://github.com/Zephyris-Pro/dnsmasq-manager/discussions)


Thanks a lot to [nginx-proxy-manager](https://github.com/NginxProxyManager/nginx-proxy-manager), which was a great source of inspiration for this project.