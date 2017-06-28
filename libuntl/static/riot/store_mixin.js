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

        load: function load(data, load_opts) {
            var store = this;
            var opts = _.defaults({}, store.opts, load_opts);
            var db = window.db;

            if (!_.isArray(data)) {
                data = [data];
            }
            if (_.isFunction(opts.modify_on_load)) {
                _.each(data, opts.modify_on_load);
            }
            store.trigger('load-start');
            window.db.transaction('rw?', db[opts.objectStoreName], function () {
                _.each(data, function (d) {
                    if (_.has(d, 'modified')) {
                        d.timestamp = _.toInteger(moment(d.modified).format('X')); // Specific to certain stores only!
                    }
                    db[opts.objectStoreName].put(d);
                });
            }).then(function () {
                store.getAll().then(function (r) {
                    store.trigger('load-end', r);
                });
            });
        },

        find: function (id, fn_opts) {
            var defaults = { limit: 10, offset: 0 };
            var store = this;
            var opts = _.defaults({}, store.opts, defaults, fn_opts);
            return window.db[opts.objectStoreName].get(id);
        },

        getAll: function getAll(opts_) {
            var store = this;
            var opts = _.defaults({}, store.opts, opts_);
            var promise = window.db[opts.objectStoreName].toArray();
            promise.then(function (objects) { store.objects = objects; return objects});
            return promise;
        },
        /**
         * Limit-offset pagination function which triggers 'pagination' with the results
         * @param opts_
         */
        get: function (opts_) {
            var store = this;
            var defaults = { limit: 10, offset: 0 };
            // Example search: search_: { type: 'startsWithIgnoreCase', word: 'communication', field: 'searchIndex' }
            var opts = _.defaults(opts_, store.opts, defaults);
            var action = _.get(opts, ['search', 'type']);
            function search() {
                var objectStore = window.db[opts.objectStoreName];
                if (_.has(opts, 'search')) {
                    switch (action) {
                    case 'startsWithIgnoreCase':
                        return objectStore
                            .where(opts.search.field)
                            .startsWithIgnoreCase(opts.search.word)
                            .distinct();
                    case 'equals':
                        return objectStore
                            .where(opts.search.field)
                            .equals(opts.search.word)
                            .distinct();
                    default:
                        return objectStore;
                    }
                } else {
                    return objectStore;
                }
            }

            search().count(function (count) { store.trigger('count', count); });
            search().offset(opts.offset)
                .limit(opts.limit)
                .toArray(function (resources) {
                    store.trigger('pagination', resources);
                })
                .then();
        },

        page: function (opts_) {
            var store = this;
            var defaults = { page: 1, page_size: 10 };
            var opts = _.defaults(opts_, store.opts, defaults);
            var pagination = _.defaults({ offset: (opts.page - 1) * opts.page_size, limit: (opts.page_size) }, opts);
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
                    store.trigger('update-start', opts, store.getAll());
                    store.objects = store.getAll();
                    // If result is paginated
                    if (!_.isUndefined(data.results)) {
                        store.load(data.results);
                    } else {
                        store.load(data);
                    }
                    // store.count(); // Sends a "count" signal with the number of records in the store

                    if (data.next && opts.getAll) {
                        opts.offset += opts.limit;
                        store.trigger('update-continued', _.extend(opts, { data: data }), store.getAll());
                        store.update(last_modified, opts);
                    } else {
                        store.trigger('update-end', opts, store.getAll());
                    }
                });
        },

        get_last_modified: function (opts_) {
            var store = this;
            var opts = _.defaults(this.opts, opts_);
            if (_.isUndefined(window.db[opts.objectStoreName])) {
                console.error('Expected to find a store at db.' + opts.objectStoreName);
                console.error('Hint: Maybe this is not defined in db.version(x.x).stores({})');
            }

            return window.db[opts.objectStoreName].orderBy('modified').last().then(function (last_value) {
                if (_.isUndefined(last_value)) {
                    store.trigger('refresh');
                } else {
                    store.trigger('refresh', last_value.modified);
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
            return window.db[opts.objectStoreName]
                .count()
                .then(function (count) {
                    store.trigger('count', count);
                });
        }
    };
}(window.mixins = window.mixins || {}));
