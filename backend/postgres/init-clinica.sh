#!/bin/sh
set -eu

# Can also be run on an existing PostgreSQL volume.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
  -v clinica_password="$CLINICA_DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', 'gp_clinica', :'clinica_password')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gp_clinica') \gexec
ALTER ROLE gp_clinica WITH LOGIN PASSWORD :'clinica_password';
SELECT format('CREATE DATABASE %I OWNER %I', 'gp_clinica', 'gp_clinica')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gp_clinica') \gexec
ALTER DATABASE gp_clinica OWNER TO gp_clinica;
SQL
