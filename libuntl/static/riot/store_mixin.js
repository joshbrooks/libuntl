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

    load: function (/** object*/ data) {

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
