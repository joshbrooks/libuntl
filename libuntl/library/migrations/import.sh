#!/usr/bin/env bash
psql -h localhost -p 5436 -U postgres -d timordata_db < import.sql > /dev/null
docker exec libuntl_db_1  bash -c "pg_dump -h legacy --schema importer -U postgres -d timordata_db --data-only --column-inserts > /tmp/dump.sql"
docker exec libuntl_db_1  bash -c "sed -i 's/SET search_path = importer, pg_catalog;/SET search_path = public, pg_catalog;/' /tmp/dump.sql"
docker exec libuntl_db_1  bash -c "psql -h db -U libuntl -d libuntl_db < /tmp/dump.sql > /dev/null"
# Dump the result
docker exec -it libuntl_db_1 bash -c "pg_dump -U postgres libuntl_db -f /tmp/`date -I -u` > /tmp/libuntl_initial.sql"