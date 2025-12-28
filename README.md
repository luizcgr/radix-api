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
