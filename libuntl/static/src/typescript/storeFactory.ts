import * as stores from "./stores";

interface IStores{
    [name:string]: stores.Store | stores.Stores.Search
}

export class ObjectFactory {

    static stores:IStores = {}

    getStore(name:string) : stores.Stores.Search {
        if (name === 'organization'){
            if (!ObjectFactory.stores.organization){
                ObjectFactory.stores.organization = new stores.Stores.OrganizationSearch(new stores.Stores.OrganizationStore('organizations'))
            }
            return <stores.Stores.Search> ObjectFactory.stores.organization
        }
        if (name === 'resource'){
            if (!ObjectFactory.stores.resource){
                ObjectFactory.stores.resource = new stores.Stores.ResourceSearch(new stores.Stores.ResourceStore('resource'))
            }
            return <stores.Stores.Search> ObjectFactory.stores.resource
        }

        if (name === 'lookup'){
            if (!ObjectFactory.stores[name]){
                ObjectFactory.stores[name] = new stores.Stores.LookupSearch(new stores.Stores.LookupStore(name))
            }
            return <stores.Stores.Search> ObjectFactory.stores[name]
        }

        if (name === 'link') {
            if (!ObjectFactory.stores[name]){
                ObjectFactory.stores[name] = new stores.Stores.LinkSearch(new stores.Stores.LinkStore(name))
            }
            return <stores.Stores.Search> ObjectFactory.stores[name]
        }
    }

}
