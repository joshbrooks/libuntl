/**
 * Created by josh on 5/4/17.
 */

(function(w, resources){
    var store_name = 'resource'
    var store;
    var ResourceStore=function(resources, opts) {
        var store = this;
        store.urls = {
            list: function(){return Urls['resource-list']()},
            detail: function(detail_id){return Urls['resource-detail'](detail_id)}
        };
        opts = opts || {};
        riot.observable(this);
        store.el = 'resources';
        store.choices = opts.choices || {};
    };
    _.extend( ResourceStore.prototype, StoreMixin );
    w.stores = window.stores || {};
    w.stores[store_name] = new ResourceStore(resources);
    store = w.stores[store_name];
    $.getJSON(store.urls.list()).done(function(data){store.load(data)});
}(window, []));
