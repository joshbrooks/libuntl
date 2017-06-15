/** Pagination functions for the store */

(function (fn) {
    fn.page = fn.page || {};
    fn.page.first = function () { this.page = 0; this.update(); };
    fn.page.next = function () { this.page += 1; this.update(); };
    fn.page.prev = function () { this.page -= 1; this.update(); };
    fn.page.last = function () {
        this.page = Math.ceil(this.filtered.length / this.pagesize) - 1;
        this.page -= 1; this.update();
    };
}(store.fn = store.fn || {}));

this.page = 0;
this.pagesize = 10;
