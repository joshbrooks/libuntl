# Import From timordata

 - Run the 'import' script against timordata
 - Export the resulting schema
 ```
 --file="/home/josh/Desktop/dump.sql" --schema='importer' --data-only --column-inserts --dbname="timordata_db"
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

