
(function (stores) {
    function MessageStore() {
        var store = this;
        store.logs = {};
        riot.observable(store);
        store.on('log', function (message_, level_, data) { /* Usage: store.trigger('add-console-log', 'Hello', 'warn') */
            var message = message_ || 'Empty message';
            var level = level_ || 'log';
            store.logs[level] = store.logs[level] || [];
            store.logs[level].push({ time: performance.now(), message: message, data: data || {} });
        });
        store.get = function (level) {
            return store.logs[level];
        };
    }
    stores.MessageStore = MessageStore;
    stores.messageStore = new stores.MessageStore(); /* Add a default messageStore */
}(window.stores = window.stores || {}));
