/* eslint-disable default-case,no-unused-vars,no-console,no-fallthrough */

var db_schema_version = 2;
window.stores = window.stores || {};

/**
 * Attach some sensible events
 */
function storeDecorator( store ){
    riot.observable(store);
    store.on('refresh', function (last_modified) {
        store.update(last_modified);
    });
    store.on('update-start', function (opts) { console.log('update-start', store, opts); });
    store.on('update-continued', function (opts) { store.getAll(); });
    store.on('update-end', function (opts) { store.getAll(); });
    store.on('refresh', function (opts) { console.log('refresh', store, opts); });
}


function ResourceStore() {
    this.opts = { objectStoreName: 'resources' };
    this.urls = {
        list: function () {return Urls.resource_list();},
        detail: function (detail_id) {return Urls.resource_detail(detail_id);}
    };
    storeDecorator(this);
}
_.extend(ResourceStore.prototype, mixins.StoreMixin);
_.extend(ResourceStore.prototype, mixins.StoreIDBMixin);
window.stores.resource = new ResourceStore();

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

(function (stores) {
    var store_name = 'organizations';

    /**
     * Initialize the database
     * @returns {Promise<DB>}
     * @param store_opts
     */

    function OrganizationStore(store_opts) {
        var store = this;
        var defaults = {
            functionprefix: 'organizations',
            dbname: 'libuntl',
            objectStoreName: 'organizations'
        };
        store.opts = _.defaults({}, defaults, store_opts);
        riot.observable(this);
        store.urls = {
            list: function () {
                return Urls.organization_list();
            },
            detail: function (detail_id) {
                return Urls.organization_detail(detail_id);
            }
        };

        store.on('refresh', function (last_modified) {
            store.update(last_modified);
        });

        store.on('update-start', function (opts) { console.log('update-start', store, opts); });
        store.on('update-continued', function (opts) { store.getAll(); });
        store.on('update-end', function (opts) { store.getAll(); });
        store.on('refresh', function (opts) { console.log('refresh', store, opts); });
    }
    _.extend(OrganizationStore.prototype, mixins.StoreMixin);
    _.extend(OrganizationStore.prototype, mixins.StoreIDBMixin);
    stores[store_name] = new OrganizationStore();
    stores[store_name].get_last_modified();
}(window.stores, []));

(function (stores, authors) {
    var store_name = 'tags';

    /**
     * Initialize the database
     * @returns {Promise<DB>}
     * @param store_opts
     */

    function TagStore(store_opts) {
        var store = this;
        var defaults = {
            functionprefix: store_name,
            dbname: 'libuntl',
            objectStoreName: store_name
        };
        store.opts = _.defaults({}, defaults, store_opts);
        riot.observable(this);
        store.urls = {
            list: function () {
                return Urls.tag_list();
            },
            detail: function (detail_id) {
                return Urls.tag_detail(detail_id);
            }
        };

        store.on('refresh', function (last_modified) {
            store.update(last_modified);
        });

        store.on('update-start', function (opts) { console.log('update-start', store, opts); });
        store.on('update-continued', function (opts) { store.getAll(); });
        store.on('update-end', function (opts) { store.getAll(); });
        store.on('refresh', function (opts) { console.log('refresh', store, opts); });
    }
    _.extend(TagStore.prototype, mixins.StoreMixin);
    _.extend(TagStore.prototype, mixins.StoreIDBMixin);
    stores[store_name] = new TagStore();
    stores[store_name].get_last_modified();
}(window.stores, []));


(function (stores, authors) {
    var store_name = 'pubtypes';

    /**
     * Initialize the database
     * @returns {Promise<DB>}
     * @param store_opts
     */

    function PubTypeStore(store_opts) {
        var store = this;
        var defaults = {
            functionprefix: store_name,
            dbname: 'libuntl',
            objectStoreName: store_name
        };
        store.opts = _.defaults({}, defaults, store_opts);
        riot.observable(this);
        store.urls = {
            list: function () {
                return Urls.pubtype_list();
            },
            detail: function (detail_id) {
                return Urls.pubtype_detail(detail_id);
            }
        };

        store.on('refresh', function (last_modified) {
            store.update(last_modified);
        });

        store.on('update-start', function (opts) { console.log('update-start', store, opts); });
        store.on('update-continued', function (opts) { store.getAll(); });
        store.on('update-end', function (opts) { store.getAll(); });
        store.on('refresh', function (opts) { console.log('refresh', store, opts); });
    }
    _.extend(PubTypeStore.prototype, mixins.StoreMixin);
    _.extend(PubTypeStore.prototype, mixins.StoreIDBMixin);
    stores[store_name] = new PubTypeStore();
    stores[store_name].get_last_modified();
}(window.stores, []));
