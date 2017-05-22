/**
 * Created by josh on 5/4/17.
 */

window.stores = window.stores || {};
(function(stores, resources){
    var store_name = 'resource';
    var store;

    /**
     * Initialize the database
     * @param database_opts
     * @returns {Promise<DB>}
     */
    function initialiseIdb(database_opts){
        /**
         * options include name for the database, name for the table, version, keyPath, indexes
         * @type {{dbname: string, version: number, objectStoreName: string, keyPath: string, indexes: [*]}}
         */
        // TODO: Input validation for this function
        var opts = _.extend({}, database_opts);

        return idb.open(opts.dbname, opts.version, function(upgradeDb){
            switch(upgradeDb.oldVersion){
                /* Add additional schema upgrades here */
                case 0:
                    var idbstore = upgradeDb.createObjectStore(opts.objectStoreName, {keyPath: opts.keyPath});
                    _.each(indexes, function initIndex(i){
                        idbstore.createIndex(i.indexName, i.field)
                    });
            }
        })
    }

    function ResourceStore(resources, store_opts) {
        var store = this;

        var defaults = {
            functionprefix: 'resources',
            dbname: 'libuntl',
            version: 1,
            objectStoreName: 'resources',
            keyPath: 'id',
            indexName: 'by-modified',
            indexes: [{
                indexName: 'by-modified',
                field: 'timestamp'
            }, {
                indexName: 'by-pubtype',
                field: 'pubtype'
            }]
        };

        store.opts = _.defaults({}, defaults, store_opts);

        riot.observable(this);
        store.urls = {
            list: function(){return Urls.resource_list()},
            detail: function(detail_id){return Urls.resource_detail(detail_id)}
        };

        // store.on('refresh', function(last_modified){updateModifiedSince(last_modified)});
        // store.refresh();
    }

    _.extend( ResourceStore.prototype, StoreMixin );
    _.extend( ResourceStore.prototype, StoreIDBMixin );

    stores[store_name] = new ResourceStore(resources);

    store = stores[store_name];

}(window.stores, []));
