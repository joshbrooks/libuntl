/**
 * Created by josh on 5/4/17.
 */

window.stores = window.stores || {};
(function (stores, resources) {
    var store;
    var store_name = 'resource';

    /**
     * Initialize the database
     * @param database_opts
     * @returns {Promise<DB>}
     */

    function ResourceStore(store_opts) {
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
            list: function () {
                return Urls.resource_list();
            },
            detail: function (detail_id) {
                return Urls.resource_detail(detail_id);
            }
        };

        store.initialiseIdb(store.opts);
        store.on('refresh', function (last_modified) {
            store.update(last_modified);
        });

        store.on('update-start',function(opts){console.log('update-start', store, opts);})
        store.on('update-continued',function(opts){store.getAll()})
        store.on('update-end',function(opts){store.getAll()})
        store.on('refresh',function(opts){console.log('refresh', store, opts);})

        // store.refresh();
    }

    _.extend(ResourceStore.prototype, mixins.StoreMixin);
    _.extend(ResourceStore.prototype, mixins.StoreIDBMixin);

    stores[store_name] = new ResourceStore(resources);
    store = stores[store_name];
    store.initialiseIdb(store.opts);
    store.get_last_modified();

}(window.stores, []));
