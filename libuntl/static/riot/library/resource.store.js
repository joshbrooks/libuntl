/**
 * Created by josh on 5/4/17.
 */

window.stores = window.stores || {};
(function(stores, resources){
    var store_name = 'resource';
    var store;
    function ResourceIdb(database_opts){
        var opts = {'dbname': 'libuntl', 'version': 1, 'table': 'resources'};
        _(opts).extend(database_opts);
        return idb.open(opts.dbname, opts.version, function(upgradeDb){
            switch(upgradeDb.oldVersion){
                case 0:
                    var idbstore = upgradeDb.createObjectStore(opts.table, {keyPath: 'id'})
                    idbstore.createIndex('by-modified', 'timestamp')
                    idbstore.createIndex('by-pubtype', 'pubtype')
            }
        })
    }

    ResourceIdb();

    function ResourceStore(resources, store_opts) {
        var store = this;
        var opts = {
            baseName: 'libuntl',
            objectStoreName: 'resources',
            indexName: 'by-modified'
        };
        _(opts).extend(store_opts);
        riot.observable(this);
        store.urls = {
            list: function(){return Urls.resource_list()},
            detail: function(detail_id){return Urls.resource_detail(detail_id)}
        };

        function addToStore(data){
           idb.open(opts.baseName).then(function(db) {
               var objectStore = db.transaction(opts.objectStoreName, 'readwrite').objectStore(opts.objectStoreName);
               _.each(data.results, function (d) {
                   d.timestamp = _.toInteger(moment(d.modified).format('X'))
                   objectStore.put(d)
               });
           });
        }

        function updateModifiedSince(last_modified, _opts) {
            var opts = _opts || {};
            _.defaults(opts, {offset: 0, limit: 100});
            console.log(opts);
            var request = $.getJSON(store.urls.list(), {
                modified__gt: last_modified,
                limit: opts.limit,
                offset: opts.offset
            });
            request.done(
                function (data) {
                    addToStore(data.results);
                    if (data.next) {
                        opts.offset += 100
                        updateModifiedSince(last_modified, opts)
                    }
                });
        }

        function refresh() {
            idb.open(opts.baseName)
                .then(function (db) {
                    db.transaction(opts.objectStoreName, 'readonly')
                        .objectStore(opts.objectStoreName).index(opts.indexName)
                        .openCursor(null, 'prev')
                        .then(function (cursor) {
                        if (cursor.value.modified) {
                            stores.resource.trigger('refresh', cursor.value.modified)
                        }
                    })
                });
            }
        store.on('refresh', function(last_modified){updateModifiedSince(last_modified)});
        refresh();
    }

    _.extend( ResourceStore.prototype, StoreMixin );
    stores[store_name] = new ResourceStore(resources);
    store = stores[store_name];

}(window.stores, []));
