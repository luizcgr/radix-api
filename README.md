# radix-api

# Ativar estatísticas de queries no postgres

```sql
CREATE EXTENSION pg_stat_statements;
```

Queries mais lentas.

```sql
SELECT
   query,
   calls,
   mean_exec_time AS avg_time_ms,
   max_exec_time AS max_time_ms
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

# Backup do banco local

```sh
docker exec -e -it radix-postgres pg_dump -p 5432 -Fc --no-acl --no-owner -h localhost -U postgres -f /tmp/radix.dump radix
docker cp radix-postgres:/tmp/radix.dump ~/radix.dump
```

# Restaurar o backup local

```sh

```
