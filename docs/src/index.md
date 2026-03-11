---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "DNSMasq Manager"
  tagline: Easily manage your custom DNS records with a modern web interface
  image:
    src: /logo.png
    alt: DNSMasq Manager Logo
  actions:
    - theme: brand
      text: Get Started
      link: /setup/
    - theme: alt
      text: User Guide
      link: /guide/

features:
  - title: 🎯 Simplified DNS Management
    details: Create and manage your DNS records (A, AAAA, CNAME, TXT) through an intuitive web interface, without manually editing configuration files.
  - title: 🎨 Modern Interface
    details: Elegant user interface based on Tabler UI with dark/light mode support, responsive and multilingual (FR/EN).
  - title: 🔒 Secure
    details: JWT authentication, user management, and mandatory password change on first login for maximum security.
  - title: 🐳 Docker Ready
    details: Simple deployment with Docker Compose. No complex configuration required, everything works out-of-the-box.
  - title: ⚡ Automatic Restart
    details: DNSMasq automatically restarts via Docker API after each modification to instantly apply your changes.
  - title: 🌐 Upstream Servers
    details: Easily configure your upstream DNS servers (Cloudflare, Google DNS, etc.) directly from the web interface.
---
