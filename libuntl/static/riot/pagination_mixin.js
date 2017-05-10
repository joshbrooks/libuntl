/**
 * Created by josh on 5/7/17.
 */
   /* Pagination functions for the store */

(function(fn){
    fn.page = fn.page || {};
    fn.page.first = function(){this.page = 0; this.update();};
    fn.page.next = function(){this.page += 1; this.update();};
    fn.page.prev = function(){this.page -= 1; this.update();};
    fn.page.last = function(){
        this.page = Math.ceil(this.filtered.length / this.pagesize) - 1
        this.page -= 1; this.update();};

}(store.fn = store.fn || {}));
        this.page = 0
    this.pagesize = 10
    first() {
        this.page = 0
    }

    prev() {
        if (this.page > 0){
            this.page--
        }
    }

    next() {
        if (this.page < (this.filtered.length / this.pagesize) - 1) {
            this.page++
        }
    }

    last() {
        this.page = Math.ceil(this.filtered.length / this.pagesize) - 1
    }