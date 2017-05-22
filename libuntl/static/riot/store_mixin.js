/**
 * @mixin
 */
var StoreMixin = {
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
var StoreIDBMixin = {

    load: function load(data){
        if (!_.isArray(data)){data = [data]};
        idb.open(store.opts.baseName).then(function(db) {
           var objectStore = db.transaction(opts.objectStoreName, 'readwrite').objectStore(opts.objectStoreName);
           _.each(data.results, function (d) {
               // d.timestamp = _.toInteger(moment(d.modified).format('X')); //Specific to certain stores only!
               objectStore.put(d)
           });
        });
    },

    getAll: function getAll(opts_) {
        var store = this;
        var opts = {};
        _.defaults(opts, store.opts, opts_);

        idb.open(opts.dbname).then(function (db) {
            db.transaction(opts.objectStoreName, 'readonly')
                .objectStore(opts.objectStoreName)
                .index(opts.indexName)
                .getAll().then(
                    function(resources){debugger; store.resources = resources; store.trigger(opts.functionprefix+'_restored')})
        })
    },

    updateModifiedSince: function updateModifiedSince(last_modified, _opts) {
            var opts = {offset: 0, limit: 100};
            _.defaults(opts, _opts);
            var request = $.getJSON(store.urls.list(), {
                modified__gt: last_modified,
                limit: opts.limit,
                offset: opts.offset
            });
            request.done(
                function (data) {
                    load(data.results);
                    if (data.next) {
                        opts.offset += 100
                        updateModifiedSince(last_modified, opts)
                    }
                });
        },

    refresh: function refresh(refresh_opts) {
        var store = this;
        var opts = {};
        _.defaults(opts, this.opts, refresh_opts);
        debugger;
        idb.open(opts.dbname)
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
        },

    /* Push a clone of the store's "template" onto the stack */
    item_push: function item_push() {

    },

    /* Pull the item from the stack at "index" */
    item_pull: function item_pull(index) {

    },

    /* Wrapper function to return item at index */
    item_get: function item_get(index) {

    }
};
