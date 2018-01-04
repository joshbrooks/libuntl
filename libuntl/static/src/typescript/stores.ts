/* window.my_stores = {} */
declare let window;

import { getJSON } from "jquery";
import { IResource, Resource, IAuthor, Author } from "./models"

export namespace Stores {
    export class ResourceStore {
        public items: Resource[];
        constructor(){this.items = []}

        show(){return this.items}

        add(r: IResource){
            this.items.push(
                new Resource(
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
        }

        async fetch(){
            let things:IResource[] = await getJSON('/api/resource/');
            for(let resource of things){
                this.add(resource)
            }
        }
    }

    export class AuthorStore {
        public items: Author[];

        constructor(){
            this.items = [];
        }

        async fetch(){
            let things:IAuthor[] = await getJSON('/api/author')
            for (let author of things){
                this.items.push(new Author(author.id, author.name))
            }
        }
    }
}