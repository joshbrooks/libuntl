/* eslint-disable default-case,no-unused-vars,no-console,no-fallthrough */

var db_schema_version = 2;
window.stores = window.stores || {};

/**
 * Attach some sensible events
 */
function storeDecorator(store) {
    riot.observable(store);
    store.on('refresh', function (last_modified) {
        store.update(last_modified);
    });
    store.on('update-start', function (opts) { console.log('update-start', store, opts); });
    store.on('update-continued', function (opts) { console.log('update-continued'); });
    store.on('update-end', function (opts) { console.log('update-end'); });
    store.on('refresh', function (opts) { console.log('refresh', store, opts); });
}


function ResourceStore() {
    this.opts = { objectStoreName: 'resources' };
    this.urls = {
        list: function () { return Urls.resource_list(); },
        detail: function (detail_id) { return Urls.resource_detail(detail_id); }
    };
    storeDecorator(this);
}
_.extend(ResourceStore.prototype, mixins.StoreMixin);
_.extend(ResourceStore.prototype, mixins.StoreIDBMixin);
window.stores.resource = new ResourceStore();
window.stores.resource.get_last_modified();


function AuthorStore() {
    this.opts = { objectStoreName: 'authors' };
    this.urls = {
        list: function () { return Urls.author_list(); },
        detail: function (detail_id) { return Urls.author_detail(detail_id); }
    };
    storeDecorator(this);
}
_.extend(AuthorStore.prototype, mixins.StoreMixin);
_.extend(AuthorStore.prototype, mixins.StoreIDBMixin);
window.stores.author = new AuthorStore();
window.stores.author.get_last_modified();

function OrganizationStore() {
    this.opts = { objectStoreName: 'organizations' };
    this.urls = {
        list: function () { return Urls.organization_list(); },
        detail: function (detail_id) { return Urls.organization_detail(detail_id); }
    };
    storeDecorator(this);
}
_.extend(OrganizationStore.prototype, mixins.StoreMixin);
_.extend(OrganizationStore.prototype, mixins.StoreIDBMixin);
window.stores.organization = new OrganizationStore();
window.stores.organization.get_last_modified();

function PublicationTypeStore() {
    this.opts = { objectStoreName: 'pubtypes' };
    this.urls = {
        list: function () { return Urls.publicationtype_list(); },
        detail: function (detail_id) { return Urls.publicationtype_detail(detail_id); }
    };
    storeDecorator(this);
}
_.extend(PublicationTypeStore.prototype, mixins.StoreMixin);
_.extend(PublicationTypeStore.prototype, mixins.StoreIDBMixin);
window.stores.pubtype = new PublicationTypeStore();
window.stores.pubtype.get_last_modified();

function TagStore() {
    this.opts = { objectStoreName: 'tags' };
    this.urls = {
        list: function () { return Urls.tag_list(); },
        detail: function (detail_id) { return Urls.tag_detail(detail_id); }
    };
    storeDecorator(this);
}
_.extend(TagStore.prototype, mixins.StoreMixin);
_.extend(TagStore.prototype, mixins.StoreIDBMixin);
window.stores.tag = new TagStore();
window.stores.tag.get_last_modified();
