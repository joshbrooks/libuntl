/* eslint-disable default-case,no-unused-vars,no-console,no-fallthrough */

var db_schema_version = 2;
window.stores = window.stores || {};

(function (stores, resources) {
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
            objectStoreName: 'resources',
            keyPath: 'id',
            indexName: 'by-modified'
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
        store.on('refresh', function (last_modified) {
            store.update(last_modified);
        });

        store.on('update-start', function (opts) { console.log('update-start', store, opts); });
        store.on('update-continued', function (opts) { store.getAll(); });
        store.on('update-end', function (opts) { store.getAll(); });
        store.on('refresh', function (opts) { console.log('refresh', store, opts); });

        // store.refresh();
    }

    _.extend(ResourceStore.prototype, mixins.StoreMixin);
    _.extend(ResourceStore.prototype, mixins.StoreIDBMixin);

    stores[store_name] = new ResourceStore(resources);
    stores[store_name].get_last_modified();
}(window.stores, []));

(function (stores, authors) {
    var store_name = 'authors';

    /**
     * Initialize the database
     * @returns {Promise<DB>}
     * @param store_opts
     */

    function AuthorStore(store_opts) {
        var store = this;
        var defaults = {
            functionprefix: 'authors',
            dbname: 'libuntl',
            objectStoreName: 'authors',
            keyPath: 'id',
            indexName: 'by-id'
        };
        store.opts = _.defaults({}, defaults, store_opts);

        riot.observable(this);
        store.urls = {
            list: function () {
                return Urls.author_list();
            },
            detail: function (detail_id) {
                return Urls.author_detail(detail_id);
            }
        };

        store.on('refresh', function (last_modified) {
            store.update(last_modified);
        });

        store.on('update-start', function (opts) { console.log('update-start', store, opts); });
        store.on('update-continued', function (opts) { store.getAll(); });
        store.on('update-end', function (opts) { store.getAll(); });
        store.on('refresh', function (opts) { console.log('refresh', store, opts); });

        // store.refresh();
        store.opts.modify_on_load = function(data){ data.thisisamazing = true};
    }

    _.extend(AuthorStore.prototype, mixins.StoreMixin);
    _.extend(AuthorStore.prototype, mixins.StoreIDBMixin);
    stores[store_name] = new AuthorStore(authors);
    stores[store_name].get_last_modified();

}(window.stores, []));
