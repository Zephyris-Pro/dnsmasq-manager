# Advanced Configuration

This guide covers advanced features of DNSMasq Manager and manual DNSMasq configuration.

## Manual Configuration Editing

While the web interface allows you to manage most needs, you can directly edit configuration files for advanced use cases.

### `dnsmasq.conf` File

The `/data/dnsmasq.conf` file contains the main DNSMasq configuration.

```bash
# Edit the file
nano ./data/dnsmasq.conf

# Restart DNSMasq to apply changes
cd docker
docker compose restart dnsmasq
```

:::warning Caution
Manual modifications may be overwritten by the web interface in some cases. Document your changes.
:::

## DNS Wildcards

Wildcards allow you to automatically resolve all subdomains of a domain.

### Configuration

Add this line to `/data/dnsmasq.conf`:

```conf
# All subdomains of *.test.local → 192.168.1.100
address=/test.local/192.168.1.100
```

Or add it to `/data/hosts`:

```conf
address=/.test.local/192.168.1.100
```

:::info
The `.` before the domain indicates a wildcard. All subdomains (including the domain itself) will be resolved.
:::

**Resolution examples:**
- `test.local` → `192.168.1.100`
- `api.test.local` → `192.168.1.100`
- `www.test.local` → `192.168.1.100`
- `anything.test.local` → `192.168.1.100`

### Use case: Local Development

Perfect for development environments with multiple applications:

```conf
# All local projects point to your dev machine
address=/.dev.local/127.0.0.1
```

Now:
- `myapp.dev.local` → `127.0.0.1`
- `otherapp.dev.local` → `127.0.0.1`
- `api.myapp.dev.local` → `127.0.0.1`

## Domain Blocking

DNSMasq can block domains by returning an invalid address.

### Block a domain

```conf
# Block ads.com
address=/ads.com/0.0.0.0

# Block all subdomains of tracker.net
address=/.tracker.net/0.0.0.0
```

### Block lists (Pi-hole style)

You can create domain block lists:

1. Create a list file:
```bash
cat > /data/blocklist.conf << 'EOF'
address=/ads.example.com/0.0.0.0
address=/tracker.example.com/0.0.0.0
address=/analytics.example.com/0.0.0.0
EOF
```

2. Add this line to `/data/dnsmasq.conf`:
```conf
conf-file=/data/blocklist.conf
```

3. Restart DNSMasq:
```bash
cd docker
docker compose restart dnsmasq
```

:::tip Block List Resources
You can use existing block lists:
- [StevenBlack/hosts](https://github.com/StevenBlack/hosts)
- [AdAway](https://adaway.org/)
- [Pi-hole block lists](https://github.com/pi-hole/pi-hole/wiki/Customising-sources-for-ad-lists)
:::

## Conditional Forwarding

Send queries for specific domains to specific DNS servers.

### Use case: Corporate network

If you need to resolve internal corporate domains via a specific DNS server:

```conf
# Send *.company.internal queries to 10.0.0.1
server=/company.internal/10.0.0.1

# Send *.corp queries to 10.0.0.2
server=/corp/10.0.0.2
```

All other queries will use default upstream servers.

## Custom DHCP (Advanced)

DNSMasq can also act as a DHCP server (requires additional network configuration).

:::warning Complex Configuration
DHCP configuration is advanced and can disrupt your network if not done correctly. Proceed with caution.
:::

### Basic DHCP configuration

Add to `/data/dnsmasq.conf`:

```conf
# Enable DHCP
dhcp-range=192.168.1.50,192.168.1.150,12h

# Gateway
dhcp-option=3,192.168.1.1

# DNS servers
dhcp-option=6,192.168.1.1

# Static leases
dhcp-host=aa:bb:cc:dd:ee:ff,192.168.1.100,myserver
```

## Performance Optimization

### Increase cache

For networks with many DNS queries:

```conf
# Default cache: 1000
cache-size=10000
```

### Disable logging

Logging can slow down DNSMasq on busy networks:

```conf
# Comment out or remove
# log-queries
```

### Prefetch DNS

Prefetch popular domains before they expire:

```conf
# Prefetch DNS entries before they expire
dns-forward-max=1000
```

## Integration with Docker Networks

### Automatic resolution of containers

You can configure DNSMasq to resolve Docker containers by their names.

#### Using Docker DNS Plugin

1. Install the plugin (example):
```bash
docker plugin install vieux/dnsmasq
```

2. Configure Docker to use DNSMasq:

Edit `/etc/docker/daemon.json`:
```json
{
  "dns": ["172.17.0.1"]
}
```

3. Restart Docker:
```bash
sudo systemctl restart docker
```

### Manual resolution

For a specific Docker network:

```bash
# Find container IP
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_name

# Add record to DNSMasq via WebUI
# mycontainer.local → 172.17.0.2
```

## DNS over HTTPS (DoH) / DNS over TLS (DoT)

DNSMasq doesn't natively support DoH/DoT, but you can use a proxy.

### With cloudflared

1. Install cloudflared:
```bash
docker run -d --name cloudflared \
  --restart=unless-stopped \
  -p 5053:5053/udp \
  cloudflare/cloudflared:latest \
  proxy-dns --port 5053 --upstream https://1.1.1.1/dns-query
```

2. Configure DNSMasq to use cloudflared:

In `/data/dnsmasq.conf`:
```conf
# Use cloudflared as upstream
server=127.0.0.1#5053
```

3. Restart DNSMasq:
```bash
cd docker
docker compose restart dnsmasq
```

Now all queries go through DoH via Cloudflare.

## Reverse DNS (PTR records)

Configure reverse DNS for local IPs.

```conf
# Reverse DNS for 192.168.1.100 → myserver.local
ptr-record=100.1.168.192.in-addr.arpa,myserver.local
```

:::info
Reverse DNS is mainly used for logging and debugging. Not essential for most use cases.
:::

## SRV Records

SRV records are used to locate services (useful for Kubernetes, Active Directory, etc.).

```conf
# Format: srv-host=_service._proto.domain,target,port,priority,weight
srv-host=_ldap._tcp.company.local,ldap.company.local,389,10,100
srv-host=_kerberos._udp.company.local,kdc.company.local,88,10,100
```

## MX Records

MX records for local mail servers:

```conf
# Mail server for domain.local
mx-host=domain.local,mailserver.local,10
mx-host=domain.local,backup-mail.local,20
```

## Monitoring and Debugging

### Enable detailed logging

```conf
log-queries
log-dhcp
log-facility=/var/log/dnsmasq.log
```

### Query analysis

```bash
# See active queries
cd docker
docker compose logs -f dnsmasq | grep query

# Count queries per domain
docker compose logs dnsmasq | grep query | awk '{print $6}' | sort | uniq -c | sort -nr
```

### Performance testing

```bash
# Test query response time
time dig @localhost myserver.local

# Load test with dnsperf
docker run --rm -it \
  -v $(pwd)/queries.txt:/queries.txt \
  benchflow/dnsperf -s localhost -d /queries.txt
```

## Security Best Practices

### Restrict DNS access

```conf
# Only listen on specific interfaces
interface=eth0
interface=docker0

# Do not listen on all interfaces
# bind-interfaces
```

### Prevent DNS rebinding

```conf
# Reject private IPs in responses (security)
stop-dns-rebind
rebind-localhost-ok
```

### Block specific clients

```conf
# Block specific IP from querying
bogus-nxdomain=1.2.3.4
```

## Backup and Restore

### Backup

```bash
# Create complete backup
tar -czf dnsmasq-backup-$(date +%Y%m%d).tar.gz ./data

# Backup to remote server
rsync -avz ./data/ user@backup-server:/backups/dnsmasq/
```

### Restore

```bash
# Restore from backup
tar -xzf dnsmasq-backup-20240216.tar.gz

# Restart services
cd docker
docker compose restart
```

### Automated backups

Create a cron job:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/dnsmasq-manager && tar -czf backups/backup-$(date +\%Y\%m\%d).tar.gz ./data
```

## Migration from Other DNS Servers

### From Pi-hole

Pi-hole uses DNSMasq internally. You can export its configuration:

```bash
# On Pi-hole
cat /etc/dnsmasq.d/04-pihole-static-dhcp.conf

# Copy custom entries to DNSMasq Manager
```

### From bind9

Convert BIND zones to DNSMasq format:

```bash
# BIND format
example.local.  IN  A  192.168.1.100

# DNSMasq format
address=/example.local/192.168.1.100
```

## Next Steps

- Return to the [User Guide](/guide/) for everyday usage
- Consult the [FAQ](/faq/) for common questions
- Join the community for support and tips
