const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const http = require('http');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const CONFIG = Object.freeze({
    hostsFile: process.env.HOSTS_FILE || '/data/hosts',
    dnsmasqConf: process.env.DNSMASQ_CONF || '/data/dnsmasq.conf',
    usersFile: process.env.USERS_FILE || '/data/users.json',
    dnsmasqContainer: process.env.DNSMASQ_CONTAINER || 'dnsmasq',
    dockerSocket: process.env.DOCKER_SOCKET || '/var/run/docker.sock',
    jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
    jwtExpiry: process.env.JWT_EXPIRY || '24h',
    defaultEmail: 'admin@example.com',
    defaultPassword: 'changeme',
});

let cachedVersion = null;

// Middleware
app.use(cors());
app.use(express.json());

// Serve React frontend static assets (here no auth required)
const frontendDir = path.join(__dirname, 'public');
app.use(express.static(frontendDir));

// Validation helpers
// https://stackoverflow.com/questions/23483855/javascript-regex-to-validate-ipv4-and-ipv6-address-no-hostnames
const HOSTNAME_RE = /^(?!-)[a-zA-Z0-9._-]{1,253}(?<!-)$/;
const IPV4_RE = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const IPV6_RE = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

function isValidHostname(h) {
    return typeof h === 'string' && HOSTNAME_RE.test(h);
}

function isValidIP(ip) {
    return typeof ip === 'string' && (IPV4_RE.test(ip) || IPV6_RE.test(ip));
}

// Async route wrapper
function asyncHandler(fn) {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Docker Engine API
// Big shoutout to https://github.com/mountain-pass/dockerengineapi-nodejsclient for the inspiration on how to interact with the Docker socket without a full client library.
function dockerRequest(method, apiPath) {
    return new Promise((resolve, reject) => {
        const req = http.request(
            { socketPath: CONFIG.dockerSocket, path: apiPath, method },
            (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 400) {
                        try { resolve(data ? JSON.parse(data) : null); }
                        catch { resolve(data); }
                    } else {
                        reject(new Error(`Docker API ${method} ${apiPath} → ${res.statusCode}: ${data}`));
                    }
                });
            }
        );
        req.on('error', reject);
        req.end();
    });
}
async function loadVersion() {
    if (cachedVersion) return cachedVersion;

    try {
        const pkgPath = path.join(__dirname, 'package.json');
        const pkgData = await fs.readFile(pkgPath, 'utf8');
        const pkg = JSON.parse(pkgData);
        cachedVersion = pkg.version || 'unknown';
    } catch (err) {
        console.warn('Could not load package.json version:', err.message);
        cachedVersion = 'unknown';
    }

    return cachedVersion;
}
// Init config files
async function initFiles() {
    await fs.mkdir('/data', { recursive: true });

    let needsUsers = false;
    try {
        const stat = await fs.stat(CONFIG.usersFile);
        if (stat.size === 0) needsUsers = true;
    } catch {
        needsUsers = true;
    }
    if (needsUsers) {
        const hash = await bcrypt.hash(CONFIG.defaultPassword, 10);
        const defaultUsers = [{
            id: 1,
            email: CONFIG.defaultEmail,
            name: 'admin',
            password: hash,
            mustChangePassword: true,
            createdAt: new Date().toISOString(),
        }];
        await fs.writeFile(CONFIG.usersFile, JSON.stringify(defaultUsers, null, 2));
        console.log(`Admin account created (${CONFIG.defaultEmail} / ${CONFIG.defaultPassword})`);
    }

    // dnsmasq.conf. Create or regenerate if empty
    let needsConf = false;
    try {
        const stat = await fs.stat(CONFIG.dnsmasqConf);
        if (stat.size === 0) needsConf = true;
    } catch {
        needsConf = true;
    }

    if (needsConf) {
        const defaultConf = [
            '# dnsmasq configuration file',
            'domain-needed',
            'bogus-priv',
            'no-resolv',
            'no-poll',
            '',
            '# Upstream DNS servers (can be overridden via WebUI)',
            'server=1.1.1.1',
            'server=1.0.0.1',
            'server=8.8.8.8',
            'server=8.8.4.4',
            '',
            '# Interface',
            'listen-address=0.0.0.0',
            'bind-interfaces',
            '',
            '# Cache',
            'cache-size=1000',
            '',
            '# Logs',
            'log-queries',
            'log-facility=-',
            '',
            '# Custom records directory',
            'conf-dir=/etc/dnsmasq.d/,*.conf',
            '',
        ].join('\n');
        await fs.writeFile(CONFIG.dnsmasqConf, defaultConf);
        console.log('Generated default dnsmasq.conf');
    }

    // hosts / custom DNS records
    try {
        await fs.access(CONFIG.hostsFile);
    } catch {
        await fs.writeFile(
            CONFIG.hostsFile,
            '# Custom DNS records\n# Format: address=/hostname/ip\n'
        );
    }

    console.log('Configuration files initialized');
}

// Reload dnsmasq via Docker API (container restart)
// SIGHUP only re-reads /etc/hosts, NOT conf-dir includes (address= directives).
// A full container restart is needed to pick up changes.
async function reloadDnsmasq() {
    try {
        await dockerRequest(
            'POST',
            `/containers/${CONFIG.dnsmasqContainer}/restart?t=1`
        );
        console.log('dnsmasq restarted successfully');
        return true;
    } catch (err) {
        console.error('Error while restarting dnsmasq:', err.message);
        return false;
    }
}

// DNS records management
async function parseRecords() {
    try {
        const content = await fs.readFile(CONFIG.hostsFile, 'utf8');
        const records = [];
        let id = 0;

        for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === '#' || trimmed.startsWith('# ')) continue;

            // Active A/AAAA record: address=/hostname/ip
            const active = trimmed.match(/^address=\/(.+?)\/(.+)$/);
            if (active) {
                records.push({
                    id: id++,
                    hostname: active[1],
                    ip: active[2],
                    type: IPV6_RE.test(active[2]) ? 'AAAA' : 'A',
                    enabled: true,
                });
                continue;
            }

            // Active CNAME record: cname=alias,target
            const cname = trimmed.match(/^cname=(.+?),(.+)$/);
            if (cname) {
                records.push({
                    id: id++,
                    hostname: cname[1],
                    ip: cname[2],
                    type: 'CNAME',
                    enabled: true,
                });
                continue;
            }

            // Active TXT record: txt-record=hostname,"value"
            const txt = trimmed.match(/^txt-record=(.+?),"?(.+?)"?$/);
            if (txt) {
                records.push({
                    id: id++,
                    hostname: txt[1],
                    ip: txt[2],
                    type: 'TXT',
                    enabled: true,
                });
                continue;
            }

            // Disabled A/AAAA record: #DISABLED# address=/hostname/ip
            const disabled = trimmed.match(/^#DISABLED#\s*address=\/(.+?)\/(.+)$/);
            if (disabled) {
                records.push({
                    id: id++,
                    hostname: disabled[1],
                    ip: disabled[2],
                    type: IPV6_RE.test(disabled[2]) ? 'AAAA' : 'A',
                    enabled: false,
                });
                continue;
            }

            // Disabled CNAME record: #DISABLED# cname=alias,target
            const disabledCname = trimmed.match(/^#DISABLED#\s*cname=(.+?),(.+)$/);
            if (disabledCname) {
                records.push({
                    id: id++,
                    hostname: disabledCname[1],
                    ip: disabledCname[2],
                    type: 'CNAME',
                    enabled: false,
                });
                continue;
            }

            // Disabled TXT record: #DISABLED# txt-record=hostname,"value"
            const disabledTxt = trimmed.match(/^#DISABLED#\s*txt-record=(.+?),"?(.+?)"?$/);
            if (disabledTxt) {
                records.push({
                    id: id++,
                    hostname: disabledTxt[1],
                    ip: disabledTxt[2],
                    type: 'TXT',
                    enabled: false,
                });
            }
        }

        return records;
    } catch (err) {
        console.error('Error while parsing records:', err.message);
        return [];
    }
}

async function writeRecords(records) {
    let content = '# Custom DNS records\n';
    content += '# Format: address=/hostname/ip, cname=alias,target, txt-record=hostname,"value"\n\n';

    for (const r of records) {
        if (r.type === 'CNAME') {
            const entry = `cname=${r.hostname},${r.ip}`;
            content += r.enabled ? `${entry}\n` : `#DISABLED# ${entry}\n`;
        } else if (r.type === 'TXT') {
            const entry = `txt-record=${r.hostname},"${r.ip}"`;
            content += r.enabled ? `${entry}\n` : `#DISABLED# ${entry}\n`;
        } else {
            const entry = `address=/${r.hostname}/${r.ip}`;
            content += r.enabled ? `${entry}\n` : `#DISABLED# ${entry}\n`;
        }
    }

    await fs.writeFile(CONFIG.hostsFile, content);
}

// Upstream servers management
async function parseUpstream() {
    try {
        const content = await fs.readFile(CONFIG.dnsmasqConf, 'utf8');
        const servers = [];
        for (const line of content.split('\n')) {
            const t = line.trim();
            if (t.startsWith('server=')) servers.push(t.slice(7));
        }
        return servers;
    } catch (err) {
        console.error('Error while parsing upstream servers:', err.message);
        return [];
    }
}

async function writeUpstream(servers) {
    const content = await fs.readFile(CONFIG.dnsmasqConf, 'utf8');
    const lines = content.split('\n');

    // Remove existing server= lines AND the section comment header
    const filtered = lines.filter((line) => {
        const t = line.trim();
        return t !== '# Upstream DNS servers' && !t.startsWith('server=');
    });

    // Find insertion point: after 'no-poll' or 'no-resolv'
    let insertIdx = filtered.findIndex((l) => l.trim() === 'no-poll');
    if (insertIdx === -1) insertIdx = filtered.findIndex((l) => l.trim() === 'no-resolv');
    if (insertIdx === -1) insertIdx = filtered.length - 1;
    insertIdx += 1;

    const block = ['', '# Upstream DNS servers', ...servers.map((s) => `server=${s}`)];
    filtered.splice(insertIdx, 0, ...block);

    await fs.writeFile(CONFIG.dnsmasqConf, filtered.join('\n'));
}

// Users management
async function loadUsers() {
    try {
        const data = await fs.readFile(CONFIG.usersFile, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading users:', err.message);
        return [];
    }
}

async function saveUsers(users) {
    await fs.writeFile(CONFIG.usersFile, JSON.stringify(users, null, 2));
}

function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        CONFIG.jwtSecret,
        { expiresIn: CONFIG.jwtExpiry }
    );
}

// Auth middleware
function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing' });
    }
    try {
        const decoded = jwt.verify(header.slice(7), CONFIG.jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}


// Auth Routes

// Login
app.post('/api/auth/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = await loadUsers();
    const user = users.find((u) => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            mustChangePassword: user.mustChangePassword || false,
        },
    });
}));

// Get current user
app.get('/api/auth/me', authMiddleware, asyncHandler(async (req, res) => {
    const users = await loadUsers();
    const user = users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        mustChangePassword: user.mustChangePassword || false,
    });
}));

// Change password
app.post('/api/auth/change-password', authMiddleware, asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'The new password must be at least 6 characters long' });
    }

    const users = await loadUsers();
    const user = users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Skip currentPassword check if mustChangePassword, otherwise require it
    if (!user.mustChangePassword) {
        if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await saveUsers(users);

    const token = generateToken(user);
    res.json({ message: 'Password changed', success: true, token });
}));

// Update profile
app.put('/api/auth/profile', authMiddleware, asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    const users = await loadUsers();
    const user = users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (email && email !== user.email) {
        if (users.some((u) => u.email === email && u.id !== user.id)) {
            return res.status(409).json({ error: 'This email is already in use' });
        }
        user.email = email;
    }
    if (name) user.name = name;
    await saveUsers(users);

    const token = generateToken(user);
    res.json({
        message: 'Profile updated',
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name },
    });
}));

app.get("/api/version", asyncHandler(async (_req, res) => {
    const version = await loadVersion();
    res.json({ version });
}));

// Protected API routes
app.use('/api', authMiddleware);

// API Routes

// Status
app.get('/api/status', asyncHandler(async (_req, res) => {
    let running = false;
    try {
        const info = await dockerRequest('GET', `/containers/${CONFIG.dnsmasqContainer}/json`);
        running = info?.State?.Running === true;
    } catch {
        // container unreachable
    }

    const [records, upstream] = await Promise.all([parseRecords(), parseUpstream()]);

    res.json({
        running,
        records_count: records.length,
        upstream_count: upstream.length,
    });
}));

// DNS Records
app.get('/api/dns/records', asyncHandler(async (_req, res) => {
    res.json(await parseRecords());
}));

app.post('/api/dns/records', asyncHandler(async (req, res) => {
    const { hostname, ip, type } = req.body;

    if (!isValidHostname(hostname)) {
        return res.status(400).json({ error: 'Invalid hostname' });
    }
    if (type === 'CNAME') {
        if (!isValidHostname(ip)) {
            return res.status(400).json({ error: 'Invalid CNAME target (must be a valid hostname)' });
        }
    } else if (type === 'TXT') {
        if (!ip || typeof ip !== 'string' || ip.length === 0) {
            return res.status(400).json({ error: 'TXT value is required' });
        }
    } else {
        if (!isValidIP(ip)) {
            return res.status(400).json({ error: 'Invalid IP address' });
        }
    }

    const records = await parseRecords();
    if (records.some((r) => r.hostname === hostname)) {
        return res.status(409).json({ error: `The hostname "${hostname}" already exists` });
    }

    records.push({ hostname, ip, type: type || 'A', enabled: true });
    await writeRecords(records);
    await reloadDnsmasq();

    res.status(201).json({ message: 'Record added', success: true });
}));

app.put('/api/dns/records/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { hostname, ip, type, enabled } = req.body;

    const records = await parseRecords();
    if (id < 0 || id >= records.length) {
        return res.status(404).json({ error: 'Record not found' });
    }

    if (hostname !== undefined && !isValidHostname(hostname)) {
        return res.status(400).json({ error: 'Invalid hostname' });
    }
    if (ip !== undefined) {
        const effectiveType = type ?? records[id].type;
        if (effectiveType === 'CNAME') {
            if (!isValidHostname(ip)) {
                return res.status(400).json({ error: 'Invalid CNAME target' });
            }
        } else if (effectiveType === 'TXT') {
            if (!ip || typeof ip !== 'string') {
                return res.status(400).json({ error: 'Invalid TXT value' });
            }
        } else if (!isValidIP(ip)) {
            return res.status(400).json({ error: 'Invalid IP address' });
        }
    }

    const rec = records[id];
    records[id] = {
        ...rec,
        hostname: hostname ?? rec.hostname,
        ip: ip ?? rec.ip,
        type: type ?? rec.type,
        enabled: enabled !== undefined ? enabled : rec.enabled,
    };

    await writeRecords(records);
    await reloadDnsmasq();

    res.json({ message: 'Record updated', success: true });
}));

app.delete('/api/dns/records/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const records = await parseRecords();

    if (id < 0 || id >= records.length) {
        return res.status(404).json({ error: 'Record not found' });
    }

    records.splice(id, 1);
    await writeRecords(records);
    await reloadDnsmasq();

    res.json({ message: 'Record deleted', success: true });
}));

// Upstream Servers
app.get('/api/dns/upstream', asyncHandler(async (_req, res) => {
    res.json(await parseUpstream());
}));

app.post('/api/dns/upstream', asyncHandler(async (req, res) => {
    const { server } = req.body;

    if (!server || !isValidIP(server)) {
        return res.status(400).json({ error: 'Invalid upstream server address' });
    }

    const servers = await parseUpstream();
    if (servers.includes(server)) {
        return res.status(409).json({ error: `The upstream server "${server}" already exists` });
    }

    servers.push(server);
    await writeUpstream(servers);
    await reloadDnsmasq();

    res.status(201).json({ message: 'Upstream server added', success: true });
}));

app.delete('/api/dns/upstream/:server', asyncHandler(async (req, res) => {
    const serverToDelete = decodeURIComponent(req.params.server);

    const servers = await parseUpstream();
    const idx = servers.indexOf(serverToDelete);
    if (idx === -1) {
        return res.status(404).json({ error: 'Upstream server not found' });
    }

    servers.splice(idx, 1);
    await writeUpstream(servers);
    await reloadDnsmasq();

    res.json({ message: 'Upstream server deleted', success: true });
}));

// SPA catch-all (serve index.html for client-side routing)
app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
});

// Global error handler 
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start 
(async () => {
    try {
        await initFiles();
        await loadVersion();
        console.log(`Application version: ${cachedVersion}`);

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`DNSMasq WebUI started on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to initialize:', err);
        process.exit(1);
    }
})();