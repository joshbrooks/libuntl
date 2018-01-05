
import { getJSON } from "jquery";
import { Models } from "./models"
import * as riot from "riot"
import * as _ from "lodash"

function pageList(items:any[], page:number, per_page:number){
    let end:number = per_page * page
    let start:number = end - per_page
    return items.slice(start, end)
}

function getPage(store:Store, page:number, per_page:number){
    return pageList(store.items, page, per_page)
}


//  abstract class Observable {
//     on?(events: string, callback: Function): void;
//     one?(events: string, callback: Function): void;
//     off?(events: string): void;
//     trigger?(eventName: string, ...args: any[]): void;
//     constructor(){
//         riot.observable(this);
//         this.on('sayhi', function(){console.log('foo')})
//         this.trigger('sayhi')
//     }
// }

abstract class Store {
    items: Models.Resty[]

    constructor(){
        this.items = [];
        riot.observable(this)
        this['on']('fetch', function(){this.fetch().then(() => {this['trigger']('fetched')})})
    }

    abstract async fetch();
    abstract get_url();
}

export module Stores {
    export class PaginatedStore {
        items: Models.Resty[] = []
        constructor(
            protected store:Store, 
            protected _page:number = 1, 
            protected per_page:number = 10
        ){
            this.page()
        }

        page = (page?:number, items?:any[]) => {
            if (page && page > 0){this._page = page}
            this.items = getPage(this.store , this._page, this.per_page)
            return this.items
        }
        current_page(){
            return this._page
        }
        page_up = () => this.page(this._page + 1)
        page_down = () => this.page(this._page - 1)
        pages = () => Math.ceil(this.items.length / this.per_page)
    }
    abstract class Search extends PaginatedStore {
        public search_result_items:Models.Resty[]
        abstract search(s:string)

        constructor(store, page, per_page){
            super(store, page, per_page);
            riot.observable(this);
            this.store['on']('fetched', () => {
                this.search_result_items = this.store.items;
                this.page();
            })
        }

        sortBy(iteratees, orders?:string[]){
            if (orders){
                this.search_result_items = _.orderBy(this.items, iteratees, orders)
            } else {
                this.search_result_items = _.sortBy(this.items, iteratees)
            }
        }

        page = (page?:number) => {
            if (page && page > 0){this._page = page}
            this.items = pageList(this.search_result_items, this._page, this.per_page)
            this['trigger']('page_changed')
            debugger;
            return this.items
        }

        pages = () => Math.ceil(this.search_result_items.length / this.per_page)

    }

    export class OrganizationSearch extends Search {
        items: Models.Resty[] = []
        constructor(store, page, per_page, sort?:string){
            super(store, page, per_page)
        }

        search(searchstring:string):Models.Resty[]{
            if (!searchstring){
                this.search_result_items = this.store.items;
                return this.page()
            };
            const re_s = new RegExp(searchstring, 'ig')
            let items = _.filter(this.store.items, function(i){
                return i['name'] !== undefined && i['name'].search(re_s) != -1
            })
            if (items.length != 0){
                this.search_result_items = items;
                return this.page()
            }
            this.search_result_items = [];
            return this.page()
        }
    }

    export class ResourceStore extends Store {
        get_url(){return  `/api/resource/`}
        async fetch(){
            let things:Models.IResource[] = await getJSON(this.get_url());
            for(let r of things){
                this.items.push(
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
                        r.user
                    )
                )
            };
        }
    }

    export class AuthorStore extends Store  {
        get_url(){return  `/api/author/`}
        async fetch(){
            let things:Models.IAuthor[] = await getJSON(this.get_url())
            for (let author of things){
                this.items.push(new Models.Author(author.id, author.name))
            }
        }
    }

    export class OrganizationStore extends Store {
        get_url(){return  `/api/organization/`}
        async fetch(){
            let things:Models.Organization[] = await getJSON(this.get_url())
            for (let org of things){
                this.items.push(new Models.Organization(org.id, org.name, org.acronyms || {}, org.contact, org.type))
            }
        }
    }
}