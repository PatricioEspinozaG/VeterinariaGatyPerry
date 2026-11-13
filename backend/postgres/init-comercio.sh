#!/bin/sh
set -eu
# Preserve existing databases while aligning commerce roles to the local .env.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
  -v productos_password="$PRODUCTOS_DB_PASSWORD" \
  -v pedidos_password="$PEDIDOS_DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', 'gp_productos', :'productos_password')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gp_productos') \gexec
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', 'gp_pedidos', :'pedidos_password')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gp_pedidos') \gexec
ALTER ROLE gp_productos WITH LOGIN PASSWORD :'productos_password';
ALTER ROLE gp_pedidos WITH LOGIN PASSWORD :'pedidos_password';
SELECT format('CREATE DATABASE %I OWNER %I', 'gp_productos', 'gp_productos')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gp_productos') \gexec
SELECT format('CREATE DATABASE %I OWNER %I', 'gp_pedidos', 'gp_pedidos')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gp_pedidos') \gexec
ALTER DATABASE gp_productos OWNER TO gp_productos;
ALTER DATABASE gp_pedidos OWNER TO gp_pedidos;
SQL
