
import Dexie from 'dexie';
import { Models } from "./models"
import * as _ from "lodash"

export class MyAppDatabase extends Dexie {
    // Declare implicit table properties.
    // (just to inform Typescript. Instanciated by Dexie in stores() method)
    organizations: Dexie.Table<Models.Organization, number>; // number = type of the primkey
    resource:Dexie.Table<Models.Resource, number>
    lookup:Dexie.Table<Models.Lookup, number|string>
    link:Dexie.Table<Models.Link, number>
    //...other tables goes here...

    constructor () {
        super("MyAppDatabase");
        this.version(1).stores({organizations: 'id, name, acronyms, contact, type, modified, deleted'});
        this.version(2).stores({organizations: 'id, name, acronyms, contact, type, modified, deleted, *words'});    
        this.version(3).stores({
            organizations: 'id, name, acronyms, contact, type, modified, deleted, *words',
            resource: 'id, name, *words',
        }); 
        this.version(4).stores({
            organizations: 'id, name, acronyms, contact, type, modified, deleted, *words',
            resource: 'id, name, *words, modified',
        });    
        this.version(5).stores({
            organizations: 'id, name, acronyms, contact, type, modified, deleted, *words',
            resource: 'id, name, *words, modified, *organization',
        });
        this.version(6).stores({
            organizations: 'id, name, acronyms, contact, type, modified, deleted, *words',
            resource: 'id, name, *words, modified, *organization',
            lookup: 'id, field, name, description, modified'
        });
        this.version(7).stores({
            organizations: 'id, name, acronyms, contact, type, modified, deleted, *words',
            resource: 'id, name, *words, modified, *organization',
            lookup: 'id, field, name, name.en, description, modified'
        });
        this.version(8).stores({
            organizations: 'id, name, acronyms, contact, type, modified, deleted, *words',
            resource: 'id, name, *words, modified, *organization',
            lookup: 'id, lookuptype, [lookuptype+id], name, name.en, description, modified'
        });

        this.version(9).stores({
            organizations: 'id, name, acronyms, contact, type, modified, deleted, *words',
            resource: 'id, name, *words, modified, *organization',
            lookup: 'id, lookuptype, [lookuptype+id], name, name.en, description, modified',
            link: 'title, resource, *words',
        })
        this.version(10).stores({
            organizations: 'id, name, acronyms, contact, type, modified, deleted, *words',
            resource: 'id, name, *words, modified, *organization',
            lookup: 'id, lookuptype, [lookuptype+id], name, name.en, description, modified',
            link: 'title, resource, *words, modified',
        })

        this.version(11).stores({
            organizations: 'id, name, acronyms, contact, type, modified, deleted, *words',
            resource: 'id, name, *words, modified, *organization',
            lookup: 'id, lookuptype, [lookuptype+id], name, name.en, description, modified',
            link: 'id, title, resource, *words, modified',
        })


        this.organizations.mapToClass(Models.Organization)
        this.resource.mapToClass(Models.Resource)
        this.organizations.hook("creating", (key, obj, trans) => {obj.words = Models.Organization.get_words(obj)})
        this.lookup.mapToClass(Models.Lookup)
        this.resource.hook("creating", (key, obj, trans) => {obj.words = Models.Resource.get_words(obj)})
        this.resource.hook("updating", (modifications, primKey, obj, transaction) => {return {words : Models.Resource.get_words(obj) , modified: new Date(obj.modified)}})
        this.resource.hook("creating", (key, obj, trans) => {
            if (obj.modified){
                obj.modified = new Date(obj.modified)
            } else {
                obj.modified = new Date()
            }
        })

        this.link.hook("creating", (key, obj, trans) => {obj.words = Models.Link.get_words(obj)})
        this.link.hook("updating", (modifications, primKey, obj, transaction) => {return {words : Models.Link.get_words(obj) , modified: new Date(obj.modified)}})
        this.link.hook("creating", (key, obj, trans) => {
            if (obj.modified){
                obj.modified = new Date(obj.modified)
            } else {
                obj.modified = new Date()
            }
        })
    }
}