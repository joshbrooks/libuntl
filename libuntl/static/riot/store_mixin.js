/**
 * @mixin
 */
/* globals Promise */
(function (mixins) {
    function cast(values) {
        return _.map(_.compact(values), function (v) {
            return isNaN(v[0]) ? v[0] : parseInt(v[0], 10);
        });
    }
    function excludeEmptyValueList(v) {
        return _.size(v) === 0;
    }


    mixins.StoreMixin = {
        /**
         * Loads data into the store
         * @memberof StoreMixin
         * @method load
         */

        get_objects: function objects() { return window.db[this.opts.objectStoreName]; },
        indexPrimaryKeys: function indexPrimaryKeys(key, values) { return this.get_objects().where(key).anyOf(cast(values)).primaryKeys(); },
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

        /**
         * Search for text in an indexed field
         * @param field
         * @param search
         * @returns {Collection<T, Key>}
         */
        search: function (fn_opts) {
            var defaults = { field: 'searchIndex', search: 'Belun' };
            var store = this;
            var opts = _.defaults({}, fn_opts, store.opts, defaults);
            return window.db[opts.objectStoreName].where(opts.field).startsWithIgnoreCase(opts.search).distinct();
        },

        getAll: function getAll(opts_) {
            var store = this;
            var opts = _.defaults({}, store.opts, opts_);
            var promise = window.db[opts.objectStoreName].toArray();
            promise.then(function (objects) { store.objects = objects; return objects; });
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

        /*
        This is a 'dumb' version of filter
         */
        filter_: function (filters) {
            this.getAll().then(function (objects) {
                var _objects = _(objects);
                _.each(filters, function (value, key) {
                    var values = _.map(value, '0');
                    if (values.length === 0) { return; }
                    console.log(key, values);
                    _objects = _objects.filter(function (object) {
                        if (_.isArray(object[key])) { return _.intersection(object[key], values).length > 0; } return _.includes(values, object[key]);
                    });
                });
                return _objects.value();
            });
        },
        filter: function (filters) {
            /* 'filters' is a key-value pairing of index and attribute to search by */
            var store = this;
            var activeFilters = _.omitBy(filters, excludeEmptyValueList); // reject zero length filters
            var queries;
            if (_.size(activeFilters) === 0) {
                queries = store.get_objects().toCollection();
                return Promise.all([queries, queries.count()]);
            }
            queries = Promise.all(_.map(activeFilters, function (values, key) {
                return store.indexPrimaryKeys(key, values);
            }));

            return queries.then(function (pkArrays) {
                var pks = _.intersection.apply(null, pkArrays);
                return [store.get_objects()
                    .where('id')
                    .anyOf(pks), _.size(pks)];
            });
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

                    if (data.next) {
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
