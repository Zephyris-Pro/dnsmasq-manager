# User Guide

This guide explains how to use DNSMasq Manager to manage your custom DNS records.

## User Interface

The DNSMasq Manager interface is designed to be simple and intuitive. It consists of three main sections:

1. **Dashboard** - Overview and statistics
2. **DNS Records** - Manage your DNS records
3. **Upstream Servers** - Configure upstream DNS servers

## Dashboard

The dashboard displays important information about your DNS server status:

- **DNSMasq Status**: Indicates if the service is running
- **Record Count**: Total number of configured DNS records
- **Upstream Servers**: Number of configured upstream DNS servers
- **Version**: DNSMasq Manager version

## DNS Records Management

### Supported Record Types

DNSMasq Manager supports four types of DNS records:

#### A Record (IPv4)

Associates a domain name with an IPv4 address.

**Example:**
- **Hostname**: `myserver.local`
- **IP**: `192.168.1.100`
- **Type**: A

Result: `myserver.local` will point to `192.168.1.100`

#### AAAA Record (IPv6)

Associates a domain name with an IPv6 address.

**Example:**
- **Hostname**: `myserver.local`
- **IP**: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`
- **Type**: AAAA

#### CNAME Record (Alias)

Creates an alias pointing to another domain name.

**Example:**
- **Hostname**: `www.myserver.local`
- **Target**: `myserver.local`
- **Type**: CNAME

Result: `www.myserver.local` will point to `myserver.local`

#### TXT Record

Stores arbitrary text information.

**Example:**
- **Hostname**: `myserver.local`
- **Value**: `v=spf1 mx -all`
- **Type**: TXT

Used for SPF, DKIM, domain verification, etc.

### Adding a Record

1. Click the **"Add Record"** button in the top right
2. Fill in the form:
   - **Type**: Select the record type (A, AAAA, CNAME, TXT)
   - **Hostname**: Enter the domain name
   - **IP/Target/Value**: Enter the IP address, target domain, or value depending on the type
3. Click **"Add"**

:::tip Automatic Validation
Fields are automatically validated:
- Hostname must be a valid domain name
- IP addresses are verified (IPv4 or IPv6)
- Invalid special characters are rejected
:::

The DNSMasq service will automatically restart to apply the new record.

### Enabling/Disabling a Record

You can temporarily disable a record without deleting it:

1. Locate the record in the table
2. Click the **switch** button in the "Status" column
3. The record will be disabled immediately

:::info
A disabled record is prefixed with `#DISABLED#` in the configuration file and is not used by DNSMasq.
:::

To re-enable it, click the switch again.

### Modifying a Record

To modify an existing record:

1. **Disable** the old record
2. **Add** a new record with the correct values
3. **Delete** the old record (optional)

:::warning
There is no direct modification function to avoid errors. This 3-step approach ensures consistency.
:::

### Deleting a Record

1. Locate the record in the table
2. Click the **"Delete"** button (trash icon)
3. Confirm deletion in the dialog box
4. The record will be deleted and DNSMasq will restart

:::danger Caution
Deletion is **permanent** and **immediate**. Make sure you want to delete the record before confirming.
:::

## Upstream Server Management

Upstream servers are the DNS servers that will be queried for domains you haven't defined locally.

### Default Upstream Servers

DNSMasq Manager automatically configures these upstream servers:

- **1.1.1.1** - Cloudflare DNS
- **1.0.0.1** - Cloudflare DNS (secondary)
- **8.8.8.8** - Google DNS
- **8.8.4.4** - Google DNS (secondary)

### Adding an Upstream Server

1. Click **"Add Upstream Server"**
2. Enter the DNS server IP address
3. Click **"Add"**

**Popular DNS servers:**

| Provider | IP Addresses |
|----------|--------------|
| Cloudflare | `1.1.1.1`, `1.0.0.1` |
| Google | `8.8.8.8`, `8.8.4.4` |
| Quad9 | `9.9.9.9`, `149.112.112.112` |
| OpenDNS | `208.67.222.222`, `208.67.220.220` |
| AdGuard DNS | `94.140.14.14`, `94.140.15.15` |

:::tip DNS with Filtering
To block ads and trackers, use DNS servers like **AdGuard DNS** or **NextDNS**.
:::

### Deleting an Upstream Server

1. Locate the server in the list
2. Click the **"Delete"** button
3. Confirm deletion

DNSMasq will restart to apply changes.

:::warning
Make sure you have at least **one upstream server** configured, otherwise DNSMasq cannot resolve external domains.
:::

## User Settings

### Changing Your Password

1. Click your username in the top right
2. Select **"Settings"**
3. In the "Security" tab:
   - Enter your **current password**
   - Enter your **new password**
   - Confirm the new password
4. Click **"Change Password"**

:::tip Strong Password
Use a password of at least 12 characters with:
- Uppercase and lowercase letters
- Numbers
- Special characters
:::

### Editing Your Profile

1. Click your username in the top right
2. Select **"Settings"**
3. In the "Profile" tab:
   - Modify your **name**
   - Modify your **email**
4. Click **"Save"**

### Changing Language

DNSMasq Manager supports multiple languages:
- **English** (default)
- **French** 


To change language:

1. Click the language selector in the top right
2. Choose your preferred language
3. The interface updates instantly

### Changing Theme

DNSMasq Manager offers two themes:
- **Light** (default)
- **Dark**

To change theme:

1. Click the theme icon in the top right (☀️ or 🌙)
2. The theme changes instantly
3. Your preference is saved in your browser

## Common Use Cases

### Creating a Local Web Server

You have a web server on your local network and want to access it via a domain name.

**Scenario:**
- Server: `192.168.1.100`
- Desired name: `mysite.local`

**Solution:**
1. Add an A record:
   - Hostname: `mysite.local`
   - IP: `192.168.1.100`
2. Access `http://mysite.local` in your browser

### Creating Subdomains

You want to create multiple subdomains for the same server.

**Scenario:**
- Server: `192.168.1.100`
- Main domain: `mysite.local`
- Subdomains: `api.mysite.local`, `admin.mysite.local`

**Solution:**
1. Add an A record for each subdomain:
   - `mysite.local` → `192.168.1.100`
   - `api.mysite.local` → `192.168.1.100`
   - `admin.mysite.local` → `192.168.1.100`

### Using a Wildcard (via advanced configuration)

If you want **all** subdomains of a domain to point to the same IP, use a wildcard.

**Scenario:**
- All subdomains of `*.mysite.local` → `192.168.1.100`

**Solution:**

Consult the [Advanced Configuration](/advanced-config/) section to configure wildcards, as this requires manual editing of the configuration file.

### Redirect with CNAME

You want both `www.mysite.local` and `mysite.local` to point to the same location.

**Solution:**
1. Add an A record:
   - Hostname: `mysite.local`
   - IP: `192.168.1.100`
2. Add a CNAME record:
   - Hostname: `www.mysite.local`
   - Target: `mysite.local`

Now `www.mysite.local` will resolve to `mysite.local`, which itself points to `192.168.1.100`.

### Service Configuration (Docker, Kubernetes, etc.)

You use Docker, Kubernetes, or other services with dynamic IPs.

**Scenario:**
- Docker service: `traefik` (IP: `172.18.0.2`)
- Docker service: `portainer` (IP: `172.18.0.3`)

**Solution:**
1. Find container IPs:
```bash
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_name
```

2. Add A records:
   - `traefik.local` → `172.18.0.2`
   - `portainer.local` → `172.18.0.3`

:::tip Automation
For dynamic environments, consider using the DNSMasq Manager REST API to automate record management.
:::

## Best Practices

### Domain Naming

- Use local TLDs: `.local`, `.lan`, `.home`, `.internal`
- Avoid using real TLDs (`.com`, `.net`, etc.) to prevent conflicts
- Be consistent in your naming

**Recommended examples:**
- `myserver.local`
- `homeassistant.home`
- `nas.lan`

**To avoid:**
- `myserver.com` (possible conflict with real domain)
- `server` (no TLD)

### Organization

For large installations, organize your records by category:

**Infrastructure:**
- `router.local`
- `switch.local`
- `nas.local`

**Services:**
- `plex.local`
- `nextcloud.local`
- `homeassistant.local`

**Development:**
- `dev.myapp.local`
- `staging.myapp.local`
- `prod.myapp.local`

### Backup

Regularly backup your configuration files:

```bash
# Create a backup
cp -r ./data ./data.backup-$(date +%Y%m%d)

# Or with tar
tar -czf data-backup-$(date +%Y%m%d).tar.gz ./data
```

### Security

- **Change the default password** immediately
- Use **strong passwords**
- Don't share your account
- Limit access to port 82 via a firewall
- Consider using a reverse proxy (nginx, traefik) with HTTPS

## Troubleshooting

### A record doesn't work

1. Verify the record is **enabled** (switch is green)
2. Verify DNSMasq is **running** (dashboard)
3. Clear your machine's DNS cache:
   ```bash
   # Linux
   sudo systemd-resolve --flush-caches
   
   # macOS
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   ```
4. Test with `dig` or `nslookup`:
   ```bash
   dig @localhost myserver.local
   ```

### Changes are not applied

1. Check the logs:
   ```bash
   cd docker
   docker compose logs webui
   docker compose logs dnsmasq
   ```
2. Manually restart the service:
   ```bash
   docker compose restart dnsmasq
   ```
3. Verify the `hosts` file is properly mounted:
   ```bash
   docker exec dnsmasq cat /etc/dnsmasq.d/custom-hosts.conf
   ```

### Conflict with existing domain

If you created a record that conflicts with a real domain (e.g., `google.com`), delete it immediately.

### Slow performance

If DNS resolutions are slow:

1. Increase cache size in `/data/dnsmasq.conf`:
   ```conf
   cache-size=10000
   ```
2. Use faster upstream servers (Cloudflare, Google)
3. Check latency to upstream servers:
   ```bash
   ping 1.1.1.1
   ```

## REST API

DNSMasq Manager exposes a complete REST API. Consult the API documentation to automate your tasks.

Base URL: `http://localhost:2/api`

### Authentication

```bash
curl -X POST http://localhost:82/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'
```

### List Records

```bash
curl http://localhost:82/api/dns/records \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add a Record

```bash
curl -X POST http://localhost:81/api/dns/records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hostname":"test.local","ip":"192.168.1.50","type":"A"}'
```

## Next Steps

- Explore [Advanced Configuration](/advanced-config/) for more advanced features
- Check the [FAQ](/faq/) for common questions
- View the [Screenshots](/screenshots/) to see the interface in action
