---
outline: deep
---

# Todo

## User Management
* Multiple accounts creation & management (SQLite or MySQL support)
* Role-based access control (Admin, Editor, Viewer roles)
* User activity logging and audit trail
* Session management and timeout configuration

## DNSMasq Features
* DHCP server configuration and management
  - Static IP reservations
  - DHCP options configuration
  - Lease time management
* TFTP server integration for network booting
* PXE boot configuration support
* DNS record types support:
  - MX records
  - SRV records
  - PTR records (reverse DNS)
* DNS wildcarding and regex matching
* DNSSEC validation support
* DNS filtering and blocklist management
* Custom DNS server configuration (upstream resolvers)
* Domain-specific DNS routing
* DNS cache management and statistics

## Internationalization
* Add Spanish translation
* Add German translation
* Add Portuguese translation
* Add Chinese translation
* And more

## File Management & Organization
* Better file tree visualization for configuration files
* Syntax highlighting for dnsmasq.conf editor
* Configuration file backup and restore
* Import/export configurations
* Configuration validation before applying
* Template system for common configurations

## Performance & Optimizations
* Backend API response caching
* WebSocket support for real-time updates
* Pagination for large record lists
* Search and filtering optimization
* Database query optimization
* Lazy loading for UI components
* Code splitting and bundle optimization
* Memory usage optimization

## UI/UX Improvements
* Responsive mobile design improvements
* Keyboard shortcuts
* Bulk operations (delete, edit multiple records)
* Advanced search and filtering
* Better notification system for errors and warnings
* Improved error messages and validation

## Testing & Quality
* Unit tests for backend
* Integration tests
* E2E tests for frontend
* CI/CD pipeline setup
* Code coverage reports

## Deployment & DevOps
* Kubernetes deployment support
* Helm chart creation
* Health check endpoints
* Prometheus metrics export
* Backup automation
* Update notification system