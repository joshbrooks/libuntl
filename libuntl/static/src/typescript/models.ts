import * as $ from "jquery";
import * as _ from "lodash";

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
        user?: Number
    }
    
    export abstract class Resty {
        _deleted: boolean = false;
        async save(){
            let stuff = await $.ajax({
                url: this.get_url(), 
                method: 'PUT',
                data: _.pick(this, Object.keys(this))
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

    export class Resource extends Resty {
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
            public user?: Number
        ){super()}
        get_url(){return  `/api/resource/${this.id}/`}
    }


    class Link{
        constructor(
            public cover: String,
            public language: String,
            public title: String,
            public resource: Number,
            public url: String,
            public file: String,
        ){}
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
        constructor(public id:number, public name:String, public acronyms:ITranslatedField, public contact:ITranslatedField, public type:Number){super()};
        get_url(){return  `/api/organization/${this.id}/`}
    }

    class Tag{
        constructor(public name:ITranslatedField, public description:ITranslatedField){} 
    }

    class OrganizationType{
        constructor(private id:Number, public name:ITranslatedField, public description:ITranslatedField){}
    }
}
