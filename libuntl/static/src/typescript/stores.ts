
import { getJSON } from "jquery";
import { Models } from "./models"
import { MyAppDatabase } from "./database"
import * as riot from "riot"
import * as _ from "lodash"
import { setTimeout } from "timers";
import { Dexie } from "dexie";


let db = new MyAppDatabase();
let getDate = (d) => {return new Date(d)}

enum Signals {
    /* Which signals may be used by a Store */
    saved = "saved",
    fetched = "fetched",
    pull = "pull",
    page_changed = "page_changed",
    save_failed = "save_failed",
}

function pageList(items:any[], page:number, per_page:number){
    let end:number = per_page * page
    let start:number = end - per_page
    return items.slice(start, end)
}

function getPage(store:Store, page:number, per_page:number){
    return pageList(store.items, page, per_page)
}

class Observable {
    on(events: string, callback: Function) {}
    one(events: string, callback: Function) {}
    off(events: string) {}
    trigger(eventName: string, ...args) {}
 
    constructor() {
       riot.observable(this);
    }
 }

enum StoreState {
    loading,
    ready
}

class DexieFilter{
    constructor(public method:string, public index:string, public value:any|any[]){}
}

interface DexieFilters{
    [name:string]: DexieFilter
}

interface ObjectUpdates{
    id?: any,
    [path:string]: string
}

export abstract class Store extends Observable {
    items: Models.Resty[]
    state: StoreState

    constructor(){
        super()
        this.items = [];
    }

    abstract async fetch():Promise<Models.Resty[]>;
    abstract get_url():string;

    abstract async get(id:number);
}

abstract class IndexedDBStore extends Store{
    constructor(public tableName: string){
        super();
        this.on(Signals.pull, async function(){
            await this.pull()
            await this.put()
        })
        this.trigger(Signals.pull);
    }

    template() {return {}}

    // abstract template():Models.Resty
    async get_params(){
        let modified = await this.getLastModified()
        let restParams = {}
        if (modified) { 
            restParams['modified__gt'] = modified.getTime() }
        return restParams
    }

    private async t () {return await db.table(this.tableName)}
    async table():Promise<Dexie.Table<any, any>>{let table = await db.table(this.tableName); return table}

    async get(id){let t = await this.t(); return t.get(_.parseInt(id));}
    async where(index:string, id:any[]){let t = await this.t(); return t.where(index).anyOf(id);}

    async collection () { let t = await this.t(); return t.toCollection()}
    async array () { let t = await this.t(); return t.toArray()}

    async put(){
        let items = await this.fetch()
        if (items) {
            await db.table(this.tableName).bulkPut(items);
            this.pull();
        }
    }

    async save(updates:ObjectUpdates): Promise<Models.Resty>{
        let method:string;
        let object:any;
        let object_id: number|string;
        if (updates.id) {
            object = await this.get(updates.id);
            method = 'PATCH';
            _.assign(object, updates);
            await object.save(method);
            object_id = await db.table(this.tableName).put(object);
            /* Otherwise, trigger a "FailedToSave" signal  */
        }
        else {
            method = 'POST';
            object = this.template()
            _.assign(object, updates);
            await object.save(method);
            object_id = await db.table(this.tableName).put(object);
        }
        return await db.table(this.tableName).get(object_id)
    }

    async pull(){
        this.items = await db.table(this.tableName).toArray()
        this.trigger(Signals.fetched)
    }

    protected async getLastModified() : Promise<Date | undefined>{
        const table = await db.table(this.tableName);
        const last = await db.table(this.tableName).orderBy('modified').last();
        return (_.isUndefined(last)) ? last : new Date(last.modified);
    }
}

interface ISearchProperties{
    list: Models.Resty[],
    pages : number,
    current_page : number
    up_disabled : boolean,
    down_disabled: boolean,
    search : DexieFilters,
    searchstring?: string
}

export module Stores {
    abstract class PaginatedStore extends Observable {
        items: Models.Resty[] = []
        constructor(
            
            protected store:IndexedDBStore, 
            protected _page:number = 1, 
            protected per_page:number = 12
        ){
            super();
            this.page(0)
        }

        get = async (id) => await this.store.get(id)

        // page = (page?:number, items?:any[]) => {
        //     if (page && page > 0){this._page = page}
        //     if (page && (page >= this.pages())){this._page = this.pages()}
        //     this.items = getPage(this.store , this._page, this.per_page)
        //     return this.items
        // }

        abstract page(p:number):Promise<Models.Resty[]|void>
        current_page(){
            return this._page
        }
        page_up = () => this.page(this._page + 1)
        page_down = () => this.page(this._page - 1)
        pages = () => Math.ceil(this.items.length / this.per_page)
    }
    export abstract class Search extends PaginatedStore {
        private count:number = 0;
        private collection:Dexie.Collection<any, any>;
        public store:IndexedDBStore;

        public dexiefilters: DexieFilters = {};

        per_page:number;
        _page: number;
        filterFunction: (any) => boolean | undefined = undefined;
        filterFunctions: ((any) => boolean)[] = [];

        constructor(_s, _p=1, _per=12
        ){  
            super(_s, _p, _per,);
            this.store.on(Signals.fetched, () => {
                this.search();
            })
        }

        static getWords(obj:any): string[] {return []}

        get = async (id) => await this.store.get(id)

        async page(page?:number){
            if (!this.collection){return this.search()}

            let _page:number = _.clamp(page || this._page, 1, this.pages())
            let start:number = this.per_page * (_page - 1)
            let items:Models.Resty[] = await this.collection.clone().offset(start).limit(this.per_page).toArray()

            let update = !_.isEqual(items, this.items) || _page !== this._page
            if (update)
                this.items = items;
                this._page = _page;
                this.trigger(Signals.page_changed);
        }

        pages = () => this.count? Math.ceil(this.count / this.per_page) : 0

        up_disabled = () => this.current_page() === this.pages();
        down_disabled  = () => this.current_page() === 1;

        setWordFilter = (value) => this.set_filter('words', 'startsWithIgnoreCase', 'words', value)
            
        set_filter = (name, method, index, args) => {
            this.dexiefilters[name] = new DexieFilter(method, index, args)
            this.search()
        }

        get_filter = (name) => _.get(this, ['dexiefilters', name, 'value'])

        remove_filter = (name) => {delete this.dexiefilters[name]; this.search()}
        

        private async search():Promise<void>{
            let s = undefined;
            
            let table:Dexie.Table<any, any>
            let collection:Dexie.Collection<any,any>
            
            // Essentially we need to "filter" on the "best" one we can find
            // then run a "filter" function on the collection for the remainder!

            if (_.get(this, ['dexiefilters','words', 'value'])){
                let d:DexieFilter = _.get(this, ['dexiefilters','words'])
                collection = await db.table(this.store.tableName).where(d.index)[d.method](d.value)
            } else {
                collection = await db.table(this.store.tableName).toCollection()
            }

            if (this.filterFunction){
                collection.filter(this.filterFunction)
            }
            for( let filter of this.filterFunctions){
                collection.filter(filter)
            }


            this.collection = collection
            this.count = await this.collection.count()
            this.page()
        }

        properties() :ISearchProperties { return {
                list : this.items,
                pages : this.pages(),
                current_page : this.current_page(),
                up_disabled : this.up_disabled(),
                down_disabled: this.down_disabled(),
                search: this.dexiefilters,
                searchstring:this.get_filter('words')
    }}


}

    export class OrganizationSearch extends Search {}

    export class ResourceSearch extends Search {}

    export class LinkSearch extends Search {}

    export class LookupSearch extends Search {
        async group(name:string){
            const lookuptypefield = 'lookuptype'
            return await db.table(this.store.tableName).where(lookuptypefield).equals(name).toArray()
        }

    }

    export class ResourceStore extends IndexedDBStore {

        get_url(){return  `/api/resource/`}


        async fetch(){
            let restParams = await this.get_params()
            let things:Models.IResource[] = await getJSON(this.get_url(), restParams);
            return _.map(things, (r) =>
                    new Models.Resource(
                        r.id,
                        r.year,
                        r.name,
                        r.description,
                        r.pubtype,
                        r.author,
                        r.organization,
                        r.tag,
                        r.cover,
                        r.user,
                        r.modified
                    )
                )
            };
        }

    export class AuthorStore extends IndexedDBStore  {
        get_url(){return  `/api/author/`}
        async fetch(){
            let things:Models.IAuthor[] = await getJSON(this.get_url())
            return _.map(things, (author) => new Models.Author(author.id, author.name))
        }
    }

    export class OrganizationStore extends IndexedDBStore {

        template(){return new Models.Organization()}

        async makeRichOrganization(id:number){
            let organization = await this.get(id)
            // populate additional fields on the organization object here
            return;
        }

        get_url(){return  `/api/organization/`}
        async fetch(){
            let restParams = await this.get_params()
            let things:Models.Organization[] = await getJSON(
                this.get_url(), 
                restParams
            )
            
            return _.map(things, (org) => new Models.Organization(
                    org.id, 
                    org.name, 
                    org.acronyms || {}, 
                    org.contact, 
                    org.type,
                    getDate(org.modified)
                ))
        }
    }

    export class LinkStore extends IndexedDBStore {
        async fetch(){
            let restParams = await this.get_params()
            let things:Models.Link[] = await getJSON(
                this.get_url(), 
                restParams
            )
            
            return _.map(things, (link) => new Models.Link(
                    link.id, 
                    link.cover, 
                    link.language,
                    link.title, 
                    link.resource,
                    link.url,
                    link.file,
                    getDate(link.modified)
                ))
        }
        get_url(){return  `/api/link/`}
        template(){return new Models.Link()}


    }

    class DateStampField {
        date:Date|undefined = undefined;
        constructor(_d:string){
            /* Receive a string and set the date parameter */
            this.date = this.getDate(_d)
        }
        getDate = (d) => {return new Date(d)}
    }

    interface ILookupObject {
        modified:string
        name:Models.ITranslatedField
        description: Models.ITranslatedField
        id: string|number
    }
    interface ILookupResponse {
        [name:string]: ILookupObject[]
    }

    export class LookupStore extends IndexedDBStore {
        get_url(){return  `/api/lookups/`}

        async fetch(){
            let restParams = await this.get_params()
            let things:ILookupResponse = await getJSON(
                this.get_url(), 
                restParams
            )

            let models = []

            for (let response in things){
                for (let lookup of things[response]){
                    models.push(new Models.Lookup(
                        response,
                        lookup.id,
                        lookup.name,
                        lookup.description,
                        new DateStampField(lookup.modified).date
                    ))
                }
            }
            return models
        }
    }
}