interface JSONField{
    en?: string,
    tet?: string,

}

export interface IResource{
    year?:Number,
    name?: JSONField,
    description?: JSONField,
    pubtype?: String,
    author?: Number[],
    organization?: Number[],
    tag?: Number[],
    cover?: String,
    user?: Number
}

export class Resource implements IResource{
    constructor(
        public year?:Number,
        public name?: JSONField,
        public description?: JSONField,
        public pubtype?: String,
        public author?: Number[],
        public organization?: Number[],
        public tag?: Number[],
        public cover?: String,
        public user?: Number
    ){}
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
    constructor(protected id:Number, public name:JSONField, public description:JSONField){};
}

export interface IAuthor{
    id: Number,
    name: JSONField
}

export class Author{
    constructor(protected id:Number, public name:JSONField){}
}

class Organization{
    constructor(public name:String, public acronyms:JSONField, public contact:JSONField, protected type:Number){};
}

class Tag{
    constructor(public name:JSONField, public description:JSONField){} 
}

class OrganizationType{
    constructor(private id:Number, public name:JSONField, public description:JSONField){}
}
