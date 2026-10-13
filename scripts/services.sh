#!/data/data/com.termux/files/usr/bin/bash
# Usage: scripts/services.sh start|stop|status

PGDATA="${PGDATA:-$PREFIX/var/lib/postgresql}"
PGLOG="$PGDATA/server.log"

start() {
  if pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
    echo "postgres: already running"
  else
    pg_ctl -D "$PGDATA" -l "$PGLOG" start >/dev/null && echo "postgres: started"
  fi

  if redis-cli ping >/dev/null 2>&1; then
    echo "redis: already running"
  else
    redis-server --daemonize yes >/dev/null && echo "redis: started"
  fi
}

stop() {
  pg_ctl -D "$PGDATA" stop >/dev/null 2>&1 && echo "postgres: stopped" || echo "postgres: not running"
  redis-cli shutdown nosave >/dev/null 2>&1 && echo "redis: stopped" || echo "redis: not running"
}

status() {
  pg_ctl -D "$PGDATA" status >/dev/null 2>&1 && echo "postgres: up" || echo "postgres: down"
  redis-cli ping >/dev/null 2>&1 && echo "redis: up" || echo "redis: down"
}

case "$1" in
  start) start ;;
  stop) stop ;;
  status) status ;;
  *) echo "Usage: $0 start|stop|status"; exit 1 ;;
esac