import * as $ from "jquery";
import * as _ from "lodash";
import { ObjectFactory } from "./storeFactory";
import * as Stores from "./stores";
import * as Urls from "./urls";

let preferred_language = 'en'

function getAllWords(text:string | null) : string[] {
    if (!text){return []}
    let _text = text.replace(/[&\(\)\-]/g, '')
    let words = _.uniq(_.split(_text, ' '))
    _.pullAll(words, ['', '-', ',', '"', "'"])
    return words;
}

function getAllWordsFromObject(object:Models.ITranslatedField) : string[]{
    let _text = _.values(object).join(' ')
    let words = getAllWords(_text)
    return words
}

export module Models {

    export interface ITranslatedField { 
        [path:string]:string;
    };
    
    export interface IResource {
        id: Number,
        year?:Number,
        name?: ITranslatedField,
        description?: ITranslatedField,
        pubtype?: String,
        author?: Number[],
        organization?: Number[],
        tag?: Number[],
        cover?: String,
        user?: Number,
        modified?: Date
    }
    
    export abstract class Resty {
        _deleted: boolean = false;
        async save(method:string = 'PUT'){
            let stuff = await $.ajax({
                url: this.get_url(), 
                method: method,
                contentType: "application/json",
                dataType: 'json',
                data: JSON.stringify(_.pick(this, Object.keys(this)))
            });
            _.assign(this, stuff)
        }

        
        async refresh(){
            let stuff = await $.ajax({
                url: this.get_url(), 
                method: 'GET',
            });
            _.assign(this, stuff)
        }
        async delete(){
            let stuff = await $.ajax({
                url: this.get_url(), 
                method: 'DELETE',
            });
            this._deleted = true;
        }
        abstract get_url():string
    }

    interface IRelatedFields {
        organization?: Organization[]
        resource?: Resource[]
        link?: Link[]
    }
    export class Resource extends Resty implements IResource {
        public words: string[]
        constructor(
            public id:Number,
            public year?:Number,
            public name?: ITranslatedField,
            public description?: ITranslatedField,
            public pubtype?: String,
            public author?: Number[],
            public organization?: Number[],
            public tag?: Number[],
            public cover?: String,
            public user?: Number,
            public modified?: Date
        ){super()}
        get_url(){return  `/api/resource/${this.id}/`}
        get_name(){return this.name[preferred_language] || this.name['en'] || this.name['tet']}
        static get_words = (obj:Resource) => getAllWordsFromObject(obj.name)
    
        async getRelated() {
            let store = await <Stores.Stores.OrganizationSearch>  new ObjectFactory().getStore('organization') 
            let organization_collection = await store.store.where('id', this.organization)
            let organization_array = await <Promise<Organization[]>> organization_collection.toArray()

            /* Related links */
            let linkStore = await <Stores.Stores.LinkSearch>  new ObjectFactory().getStore('link') 
            let linkTable = await linkStore.store.table();
            let linkCollection = linkTable.where('resource').equals(<number>this.id);
            let linkArray = await <Promise<Link[]>> linkCollection.toArray()
            
            let related: IRelatedFields = {organization: organization_array, link:linkArray}

            return related
        }
    }


    export class Link extends Resty{
        get_url(){return  `/api/link/${this.id}/`}
        constructor(
            public id?: Number,
            public cover?: string,
            public language?: string,
            public title?: string,
            public resource?: Number,
            public url?: string,
            public file?: string,
            public modified?:Date,
            public words?: string[]
        ){super();}
    
        static get_words = (obj:Link) => getAllWords(obj.title)
    }

    class PublicationType{
        constructor(protected id:Number, public name:ITranslatedField, public description:ITranslatedField){};
    }

    export interface IAuthor{
        id: Number,
        name: ITranslatedField
    }

    interface IOrganization {
        id: number
    }

    export class Author extends Resty {
        constructor(protected id:Number, public name:ITranslatedField){super()}
        get_url(){return  `/api/author/${this.id}/`}
    }

    export class Organization extends Resty {
        public id:number
        public name:string
        public acronyms:ITranslatedField
        public contact
        public type:number
        public modified:Date
        public words: string[]

        constructor(
            _id?:number, 
            _name?:string, 
            _acronyms?:ITranslatedField, 
            _contact?:ITranslatedField, 
            _type?:number,
            _modified?:Date
        ){
            super();
            this.id = _id;
            this.name = _name;
            this.acronyms = _acronyms;
            this.contact = _contact;
            this.type = _type;
            this.modified = _modified;
        };
                
        get_url(){return  (this.id) ? `/api/organization/${this.id}/` : `/api/organization/`}

        

        static get_words = (obj:Organization) => getAllWords(obj.name)

        async getRelated() {
            let store = await <Stores.Stores.OrganizationSearch>  new ObjectFactory().getStore('resource')
            let table = await store.store.table()
            let resources  = await <Promise<Resource[]>> table.where('organization').equals(this.id).toArray()
            let related: IRelatedFields = {resource: resources}
            return related
        }

    }

    class Tag{
        constructor(public name:ITranslatedField, public description:ITranslatedField){} 
    }

    export class Lookup extends Resty{
        lookuptype: string
        id:number
        name: ITranslatedField
        description:ITranslatedField
        modified:Date
        constructor(_s, _i, _n, _d, _m){
            super();
            this.lookuptype = _s;
            this.id = _i;
            this.name = _n;
            this.description = _d;
            this.modified = _m;
        }
        get_url(){return  `/api/organizationtype/${this.id}/`}

        async getRelated() {
            let organizationSearch = await <Stores.Stores.ResourceSearch>  new ObjectFactory().getStore('oranization') 
            let organization_collection = await organizationSearch.store.where('id', [this.id])
            let organization_array = await <Promise<Organization[]>> organization_collection.toArray()
            let related: IRelatedFields = {organization: organization_array}
            return related
        }

    }
    
}
