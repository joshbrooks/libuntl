# Import From timordata

 - Run the 'import' script against timordata
 - Export the resulting schema
 ```
 --file="/home/josh/Desktop/dump.sql" --schema='importer' --data-only --column-inserts --dbname="timordata_db"
 ```

```
pg_dump -h localhost --port 5436 -U postgres --file="/home/josh/Desktop/dump.sql" --schema='importer' --data-only --column-inserts --dbname="timordata_db"
```

 - Change ocurences of 'importer' to 'public'
 - Set the search path to 'public'
 - Run
 ```
 psql -h localhost -p 5435 -U postgres -d libuntl_db < dump.sql
 ```
 Or
 ```
 psql -h localhost -p 5435 -U postgres -d libuntl_db

 \i ~/Desktop/dump.sql
 ```

docker exec libuntl_db_1 pg_dump -h legacy --schema importer -U postgres -d timordata_db --data-only --column-inserts
sed -i 's/SET search_path = importer, pg_catalog;/SET search_path = public, pg_catalog;/' dump.sql

psql -h localhost -p 5436 -U postgres -d timordata_db < import.sql > /dev/null
docker exec libuntl_db_1  bash -c "pg_dump -h legacy --schema importer -U postgres -d timordata_db --data-only --column-inserts > /tmp/dump.sql"
docker exec libuntl_db_1  bash -c "sed -i 's/SET search_path = importer, pg_catalog;/SET search_path = public, pg_catalog;/' /tmp/dump.sql"
docker exec libuntl_db_1  bash -c "psql -h db -U libuntl -d libuntl_db < /tmp/dump.sql > /dev/null"

