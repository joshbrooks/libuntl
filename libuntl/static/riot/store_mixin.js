/**
 * @mixin
 */
(function (mixins) {
    mixins.StoreMixin = {
        /**
         * Loads data into the store
         * @memberof StoreMixin
         * @method load
         */
        load: function (/** object*/ data) {
            /* Specify "sortBy" in the Store to sort data by a given property */
            if (this.sortBy) {
                data = _.sortBy(data, this.sortBy);
            }
            this._initial = _.cloneDeep(data);
            this[this.el] = _.cloneDeep(data);
            this.trigger(this.el + '_restored');
        },

        /* Push a clone of the store's "template" onto the stack */
        item_push: function item_push() {
            var store = this;
            var temp = _.clone(store.template);
            var index = store[store.el].push(temp) - 1;
            return { index: index, item: temp };
        },

        /* Pull the item from the stack at "index" */
        item_pull: function item_pull(index) {
            var store = this;
            _.pullAt(store[store.el], index);
        },

        /* Wrapper function to return item at index */
        item_get: function item_get(index) {
            var store = this;
            return { index: index, item: store[store.el][index] };
        }
    };

    /**
     * @mixin
     */
    mixins.StoreIDBMixin = {

        load: function load(data) {
            var store = this;
            var database;
            var transaction;
            var objectstore;
            if (!_.isArray(data)) {
                data = [data];
            }
            store.trigger('load-start');
            idb.open(store.opts.dbname).then(function (db) {
                database = db;
                transaction = database.transaction(store.opts.objectStoreName, 'readwrite');
                objectstore = transaction.objectStore(store.opts.objectStoreName);
                _.each(data, function (d) {
                    d.timestamp = _.toInteger(moment(d.modified).format('X')); // Specific to certain stores only!
                    objectstore.put(d);
                });
                store.trigger('load-end');
            });
        },

        getAll: function getAll(opts_) {
            var store = this;
            var opts = {};
            _.defaults(opts, store.opts, opts_);

            idb.open(opts.dbname).then(function (db) {
                return db.transaction(opts.objectStoreName, 'readonly')
                    .objectStore(opts.objectStoreName)
                    .index(opts.indexName)
                    .getAll();
            }).then(
                function (resources) {
                    store.resources = resources;
                    store.trigger(opts.functionprefix + '_restored');
                });
        },
        /**
         * Limit-offset pagination function which triggers 'pagination' with the results
         * @param opts_
         */
        get: function (opts_) {
            var results = [];
            var store = this;
            var defaults = { limit: 10, offset: 0 };
            var opts = _.defaults(opts_, store.opts, defaults);
            console.log(opts);
            idb.open(opts.dbname).then(function openCursor(db) {
                return db.transaction(opts.objectStoreName, 'readonly')
                    .objectStore(opts.objectStoreName)
                    .index(opts.indexName)
                    .openCursor();
            }).then(function addObject(cursor) {
                if (opts.offset && !opts.advanced){opts.advanced=true; return cursor.advance(opts.offset).then(addObject)};
                if (!cursor || results.length >= opts.limit) {
                    store.trigger('pagination', results);
                } else {
                    results.push(cursor.value);
                    return cursor.continue().then(addObject);
                }
            });
        },

        page: function (opts_) {
            var store = this;
            var defaults = { page: 1, page_size: 10 };
            var opts = _.defaults(opts_, store.opts, defaults);
            var pagination = { offset: (opts.page - 1) * opts.page_size, limit: (opts.page_size) };
            store.get(pagination);
        },

        update: function updateModifiedSince(last_modified, _opts) {
            var opts = {};
            var defaults = { offset: 0, limit: 100 };
            var store = this;
            var request;
            if (_.isUndefined(last_modified)) {
                console.warn('No last_modified param passed');
            }
            _.defaults(opts, _opts, defaults);
            request = $.getJSON(store.urls.list(), {
                modified__gt: last_modified,
                limit: opts.limit,
                offset: opts.offset
            });
            request.done(
                function (data) {
                    store.trigger('update-start', opts);
                    store.load(data.results);
                    store.count(); // Sends a "count" signal with the number of records in the store
                    if (data.next) {
                        opts.offset += 100;
                        store.trigger('update-continued', _.extend(opts, { data: data }));
                        store.update(last_modified, opts);
                    } else {
                        store.trigger('update-end', opts);
                    }
                });
        },

        get_last_modified: function (opts_) {
            var store = this;
            var opts = _.defaults(this.opts, opts_);
            var database;

            // Obtain the first result of the "index"
            idb.open(opts.dbname)
                .then(function (db) {
                    database = db;
                    return database
                        .transaction(opts.objectStoreName, 'readonly')
                        .objectStore(opts.objectStoreName)
                        .openCursor(null, 'prev');
                }).then(function (last) {
                    if (_.isUndefined(last)) {
                        store.trigger('refresh');
                    } else {
                        store.trigger('refresh', last.value.modified);
                    }
                });
        },

        /* Push a clone of the store's "template" onto the stack */
        item_push: function item_push(data) {
            this.load(data || _.clone(this.template) || {});
        },

        /* Pull the item from the stack at "index" */
        // eslint-disable-next-line
        item_pull: function item_pull(index) {

        },

        /* Wrapper function to return item at index */
        // eslint-disable-next-line
        item_get: function item_get(index) {

        },

        count: function (opts_) {
            var store = this;
            var opts = _.defaults(this.opts, opts_);
            idb.open(opts.dbname)
                .then(function (db) {
                    return db
                        .transaction(opts.objectStoreName, 'readonly')
                        .objectStore(opts.objectStoreName)
                        .count();
                }).then(function (count) {
                    store.trigger('count', count);
                });
        },

        initialiseIdb: function initializeIdb(database_opts) {
            /**
             * options include name for the database, name for the table, version, keyPath, indexes
             * @type {{dbname: string, version: number, objectStoreName: string, keyPath: string, indexes: [*]}}
             */
                // TODO: Input validation for this function
            var opts = _.extend({}, database_opts);

            return idb.open(opts.dbname, opts.version, function (upgradeDb) {
                var idbstore;
                // eslint-disable-next-line default-case
                switch (upgradeDb.oldVersion) {
                    /* Add additional schema upgrades here */
                case 0:
                    idbstore = upgradeDb.createObjectStore(opts.objectStoreName, { keyPath: opts.keyPath });
                    _.each(opts.indexes, function initIndex(i) {
                        idbstore.createIndex(i.indexName, i.field);
                    });
                }
            });
        }
    };
}(window.mixins = window.mixins || {}));
