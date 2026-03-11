# Installation and Configuration

This guide walks you through the installation and initial configuration of DNSMasq Manager.

## Prerequisites

Before starting, make sure you have:

- **Docker** version 20.10 or higher
- **Docker Compose** version 2.0 or higher
- Access to Docker socket (`/var/run/docker.sock`)
- Port 53 (DNS) and 82 (WebUI) available

## Quick Installation

### 1. Clone the project

```bash
git clone https://github.com/Zephyris-Pro/dnsmasq-manager.git
cd dnsmasq-manager
```

### 2. Start the services

```bash
cd docker
docker compose up -d
```

This command will:
- Build the necessary Docker images
- Create data volumes
- Start DNSMasq on port 53
- Start the Web interface on port 82

### 3. Access the interface

Open your browser and go to: **http://localhost:82**

## First Startup

### Initial Login

On first startup, an administrator account is automatically created:

- **Email**: `admin@example.com`
- **Password**: `changeme`

:::warning Important Security
You will be **required** to change your password on your first login. Choose a strong password.
:::

### Password Change

1. Log in with the default credentials
2. You will be automatically redirected to the password change page
3. Enter your new password (minimum 8 characters)
4. Confirm the new password
5. Click "Change Password"

You will then be automatically logged in with your new password.

## File Structure

After installation, the data file structure will be:

```
dnsmasq-manager/
├── data/
│   ├── dnsmasq.conf       # DNSMasq configuration
│   ├── hosts              # Custom DNS records
│   └── users.json         # User database
├── docker/
│   ├── docker-compose.yml # Docker Compose configuration
│   ├── webui/
│   │   └── Dockerfile     # WebUI Dockerfile
│   ├── backend/
│   │   └── Dockerfile     # Backend Dockerfile (standalone)
│   └── dnsmasq/
│       ├── Dockerfile     # DNSMasq Dockerfile
│       └── entrypoint.sh  # DNSMasq entrypoint script
└── ...
```

### `dnsmasq.conf` File

This file contains the main DNSMasq configuration. It is automatically generated on first startup with default values:

```conf
# dnsmasq configuration file
domain-needed
bogus-priv
no-resolv
no-poll

# Upstream DNS servers (can be overridden via WebUI)
server=1.1.1.1
server=1.0.0.1
server=8.8.8.8
server=8.8.4.4

# Interface
listen-address=0.0.0.0
bind-interfaces

# Cache
cache-size=1000

# Logs
log-queries
log-facility=-

# Custom records directory
conf-dir=/etc/dnsmasq.d/,*.conf
```

### `hosts` File

This file contains your custom DNS records in DNSMasq format:

```conf
# Custom DNS records
# Format: address=/hostname/ip, cname=alias,target, txt-record=hostname,"value"

address=/myserver.local/192.168.1.100
address=/api.myserver.local/192.168.1.100
cname=www.myserver.local,myserver.local
```

:::tip
You **never need to manually edit this file**. Use the web interface to manage your records.
:::

### `users.json` File

This file contains the user database (passwords hashed with bcrypt).

:::warning
Never share this file. It contains sensitive information.
:::

## Docker Compose Configuration

The `docker/docker-compose.yml` file defines two services:

### DNSMasq Service

```yaml
dnsmasq:
  build: ./dnsmasq
  container_name: dnsmasq
  cap_add:
    - NET_ADMIN
  ports:
    - "53:53/udp"
    - "53:53/tcp"
  volumes:
    - ./data/dnsmasq.conf:/etc/dnsmasq.conf
    - ./data/hosts:/etc/dnsmasq.d/custom-hosts.conf
  restart: unless-stopped
  networks:
    - dns-net
```

### WebUI Service

```yaml
webui:
  build:
    context: ..
    dockerfile: docker/webui/Dockerfile
  container_name: dnsmasq-webui
  ports:
    - "82:3000"
  volumes:
    - ./data:/data:rw
    - /var/run/docker.sock:/var/run/docker.sock:ro
  environment:
    - NODE_ENV=production
    - DNSMASQ_CONTAINER=dnsmasq
  depends_on:
    - dnsmasq
  restart: unless-stopped
  networks:
    - dns-net
```

## Customization

### Changing Ports

To use different ports, modify the `ports` lines in `docker/docker-compose.yml`:

```yaml
# To use port 8080 for the web interface
ports:
  - "8080:3000"

# To use port 5353 for DNS (non-standard)
ports:
  - "5353:53/udp"
  - "5353:53/tcp"
```

Then restart:

```bash
cd docker
docker compose down
docker compose up -d
```

### Environment Variables

You can customize the behavior via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3000` |
| `JWT_SECRET` | Secret for JWT tokens | Randomly generated |
| `JWT_EXPIRY` | Token validity duration | `24h` |
| `DNSMASQ_CONTAINER` | DNSMasq container name | `dnsmasq` |
| `HOSTS_FILE` | Hosts file path | `/data/hosts` |
| `DNSMASQ_CONF` | DNSMasq config path | `/data/dnsmasq.conf` |
| `USERS_FILE` | Users file path | `/data/users.json` |

Example:

```yaml
environment:
  - NODE_ENV=production
  - DNSMASQ_CONTAINER=dnsmasq
  - JWT_EXPIRY=48h
```

## Installation Verification

### Check that containers are running

```bash
cd docker
docker compose ps
```

You should see:
```
NAME                IMAGE                  STATUS
dnsmasq             dnsmasq-manager-dnsmasq      Up
dnsmasq-webui       dnsmasq-manager-webui        Up
```

### Test the DNS server

```bash
# Test with dig
dig @localhost myserver.local

# Test with nslookup
nslookup myserver.local localhost
```

### Check logs

```bash
# DNSMasq logs
cd docker
docker compose logs dnsmasq

# WebUI logs
docker compose logs webui

# Follow logs in real-time
docker compose logs -f
```

## System Configuration

### Using DNSMasq as Primary DNS Server

#### Linux (systemd-resolved)

Edit `/etc/systemd/resolved.conf`:

```conf
[Resolve]
DNS=127.0.0.1
FallbackDNS=1.1.1.1 8.8.8.8
```

Restart the service:

```bash
sudo systemctl restart systemd-resolved
```

#### Linux (manual)

Edit `/etc/resolv.conf`:

```conf
nameserver 127.0.0.1
```

:::warning
On some distributions, this file is automatically regenerated. Consult your distribution's documentation.
:::

#### macOS

Go to **System Preferences** → **Network** → **Advanced** → **DNS** and add `127.0.0.1`.

#### Windows

Go to **Network Settings** → **Properties** → **IPv4** → **DNS** and configure `127.0.0.1` as the preferred DNS server.

#### Router

For all devices on your network to use DNSMasq, configure your server's IP address as the DNS server in your router's DHCP settings.

## Troubleshooting

### Port 53 is already in use

If you already have a DNS service on your machine:

1. Identify the service:
```bash
sudo lsof -i :53
```

2. Stop the conflicting service (example for systemd-resolved):
```bash
sudo systemctl stop systemd-resolved
sudo systemctl disable systemd-resolved
```

3. Or use a different port for DNSMasq (see Customization section).

### Cannot connect to web interface

1. Verify the container is running:
```bash
cd docker
docker compose ps webui
```

2. Check the logs:
```bash
docker compose logs webui
```

3. Verify the port is not already in use:
```bash
sudo lsof -i :82
```

### DNSMasq won't start

1. Check Docker socket permissions:
```bash
ls -l /var/run/docker.sock
```

2. Add your user to the docker group:
```bash
sudo usermod -aG docker $USER
```

3. Log out and log back in to apply changes.

### Permission errors on data files

```bash
# Give proper permissions to data folder
sudo chown -R $USER:$USER ./data
chmod -R 755 ./data
```

## Next Steps

Now that DNSMasq Manager is installed and configured:

- Consult the [User Guide](/guide/) to learn how to manage your DNS records
- Explore [Advanced Configuration](/advanced-config/) to customize DNSMasq
- Read the [FAQ](/faq/) for common questions
