#!/bin/sh
set -e

# Ensure required directories exist
mkdir -p /etc/dnsmasq.d /var/run

echo "Démarrage de dnsmasq..."
# exec replaces the shell -> dnsmasq becomes PID 1 and receives signals (SIGHUP, SIGTERM) directly
exec dnsmasq --no-daemon --keep-in-foreground --pid-file=/var/run/dnsmasq.pid
