#!/bin/sh
set -eu

# Runs only when the PostgreSQL data volume is new.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
  -v auth_password="$AUTH_DB_PASSWORD" \
  -v pacientes_password="$DB_PASSWORD" \
  -v citas_password="$CITAS_DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', 'gp_auth', :'auth_password') \gexec
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', 'gp_pacientes', :'pacientes_password') \gexec
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', 'gp_citas', :'citas_password') \gexec

SELECT format('CREATE DATABASE %I OWNER %I', 'gp_auth', 'gp_auth') \gexec
SELECT format('CREATE DATABASE %I OWNER %I', 'gp_pacientes', 'gp_pacientes') \gexec
SELECT format('CREATE DATABASE %I OWNER %I', 'gp_citas', 'gp_citas') \gexec
SQL
