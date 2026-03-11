FROM alpine:latest

RUN apk add --no-cache dnsmasq

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 53/udp 53/tcp

ENTRYPOINT ["/entrypoint.sh"]
