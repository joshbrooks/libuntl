<organizationlist>
<a href="#organizationedit/create">Add an Organization</a>
    <input oninput={search} value={searchstring}></input>
    <button onclick={up}>Up</button>
    <button onclick={down}>Down</button>
    <span>{current_page} / {pages}</span>

    <div class="row">
        <div class="col-xs-3" each={item in list}>
            <div  style="height:200px; border:1px solid black; border-radius: 5px; ">{_.invoke(item, 'get_name') || item.name}
                <a href="/#organizationdetail/{item.id}">Forward</a>
            </div>
        </div>
    <script>
        declare const _;
        declare const stores;
        const tag = this;
        const setStore = () => {tag.store = stores.getStore('organization')}
        
        tag.on('route', (r) => {});
        tag.on('mount', () => {
            setStore();
            tag.update(tag.store.properties());
            tag.store.on('page_changed', () => {
                tag.update(tag.store.properties());
            })
        })
        tag.up = () => tag.store.page_up()
        tag.down  = () => tag.store.page_down()
        tag.search = (e) => tag.store.setWordFilter(e.target.value)
    </script>
</organizationlist>

<lookup-tag>
    <p>{JSON.stringify(item)}</p>
  <script>
    var tag = this;
    tag.item = undefined;
    tag.related = {resource: []}
    declare const stores;
    const storeName='lookup';
    const load = (item) => {
        if (!item){tag.update({item: undefined, error: {message: 'Sorry, that lookup might have been removed'}}); return}
        item.getRelated().then(function(related){tag.update({item: item, related:related});})
    }
    const get = (number) => stores.getStore(storeName).get(number).then(load)
    this.on('route', number => get(number))
  </script>

</lookup-tag>

<lookuplist>
    <input oninput={search} value={searchstring}></input>
    <button onclick={up}>Up</button>
    <button onclick={down}>Down</button>
    <span>{current_page} / {pages}</span>

    <div class="row">
        <div class="col-xs-3" each={item in list}>
            <div  style="height:200px; border:1px solid black; border-radius: 5px; ">{_.invoke(item, 'get_name') || item.name}
                <a href="/#lookupdetail/{item.id}">Forward</a>
            </div>
        </div>
    <script>
        declare const _;
        declare const stores;
        const tag = this;
        const setStore = () => {tag.store = stores.getStore('lookup')}
        
        tag.on('route', (r) => {});
        tag.on('mount', () => {
            setStore();
            tag.update(tag.store.properties());
            tag.store.on('page_changed', () => {
                tag.update(tag.store.properties());
            })
        })
        tag.up = () => tag.store.page_up()
        tag.down  = () => tag.store.page_down()
        tag.search = (e) => tag.store.setWordFilter(e.target.value)
    </script>
</lookuplist>

<resourcelist>
    <input oninput={search} value={searchstring}></input>
    <button onclick={up}>Up</button>
    <button onclick={down}>Down</button>
    <span>{current_page} / {pages}</span>
    <div class="row">
        <div class="col-xs-3" each={item in list}>
            <div  style="height:200px; border:1px solid black; border-radius: 5px; ">
            {_.invoke(item, 'get_name') || item.name}
            <a href="/#resourcedetail/{item.id}">Forward</a>
            </div>
        </div>
    <script>
        declare const _;
        const tag = this;
        declare const stores;
        const setStore = () => {tag.store = stores.getStore('resource')}
        
        tag.on('route', (r) => {});
        tag.on('mount', () => {
            setStore();
            tag.update(tag.store.properties());
            tag.store.on('page_changed', () => {
                tag.update(tag.store.properties());
            })
        })
        tag.up = () => tag.store.page_up()
        tag.down  = () => tag.store.page_down()
        tag.search = (e) => tag.store.setWordFilter(e.target.value)
    </script>
</resourcelist>

<app>
    
    <router>
        <route path="organizationlist">
            <h4> organizations </h4>
            <organizationlist></organizationlist>
        </route>
        <route path="organizationdetail/*">
            <organization-tag></organization-tag>
        </route>
        <route path="organizationedit/*">
            <organization-edit></organization-edit>
        </route>

        <route path="resourcelist">
            <h4> Resources </h4>
            <resourcelist></resourcelist>
        </route>
        <route path="resourcedetail/*">
            <h4> Resource </h4>
            <resource-tag></resource-tag>
        </route>

        <route path="testing/*">
            <h4> Testing </h4>
            <testing-tag></testing-tag>
        </route>

        <route path="lookuplist">
            <h4> lookup </h4>
            <lookuplist></lookuplist>
        </route>


        <route path="lookupdetail/*">
            <lookup-tag></lookup-tag>
        </route>


        <route path="coffee"><p>CoffeeBreak</p></route>
    </router>
    var tag = this;
</app>

<resource-tag>
  <p>{JSON.stringify(item)}</p>
    
    <h4>{title}<span class="small">{title_language}</span></h4>
    

    <h5>Organizations</h5>
    <virtual if={related && related.organization}>
    <p  each={org in related.organization}>
        <a href="#organizationdetail/{org.id}">{org.name}</a>
    </p>
    </virtual>

    <h5>Links</h5>
    <virtual if={related && related.link}>
    <p  each={link in related.link}>
        <a href="#linkdetail/{link.id}">{link.title}</a>
    </p>
    </virtual>



  <a href="/#resourcelist">Back</a>
  
  <script>
    var tag = this;
    declare const stores;
    declare const _;
    const storeName='resource';
    const load = (item) => {
        item.getRelated().then(function(related){
            debugger;
            tag.update({item: item, related:related})})
    }
    const get = (number) => {
        tag.update({item:undefined, related:[]})
        stores.getStore(storeName).store.get(number).then(load)
    }
    
    this.on('route', number => get(number))
    tag.on('update', function(){
        if (!tag.item){return}
        let title:string = undefined;
        let title_language = undefined;
        let display_field:string = 'name';
        let languages = _.get(window, 'LanguagePreferences', ['en', 'tet', 'id','pt']);
        _.each(languages, function(language){
            if (_.isUndefined(title)){
                let thisLanguageTitle = _.get(tag, ['item', display_field, language])
                console.log(thisLanguageTitle)
                if (thisLanguageTitle){
                    title = thisLanguageTitle
                    title_language = language
                }
            }
        })
        if (title != this.title){
            this.update({title:title, title_language: title_language})
        }
    })
  </script>
</resource-tag>


<organization-tag>
    <virtual if={item}>
        <a href="/#organizationlist">Back</a>
        <h4>{item.name}</h4>
            <h5>Contact</h5>
                <div class="col col-xs-12">
                    <div if={item && item.contact} class="row" each={i,j in item.contact}>
                        <div class="col col-xs-2"><strong>{j}</strong></div>
                        <div class="col col-xs-3">{i}</div>
                        <div class="clearfix">
                    </div>
                </div>
            <h5 if={related && related.resource && related.resource.length}>Resources ({related.resource.length})</h5>
            <p if={!related || !related.resource || !related.resource.length}>
            There are no resources
            </p>
            <p if={related && related.resource} each={resource in related.resource}>
                <a href="#resourcedetail/{resource.id}">{resource.name.en}</a>
            </p>

        <a class="btn btn-link btn-default btn-sm" href="/#organizationedit/{item.id}">Edit</a>

    </virtual>

    <virtual if={!item && error}>
        <h4> Oops </h4>
        <p>{error.message}</p>
    </virtual>

  <script>
    var tag = this;
    tag.item = undefined;
    tag.related = {resource: []}
    declare const stores;
    const storeName='organization';
    const load = (item) => {
        if (!item){tag.update({item: undefined, error: {message: 'Sorry, that organisation might have been removed'}}); return}
        item.getRelated().then(function(related){tag.update({item: item, related:related});})
    }
    const get = (number) => stores.getStore(storeName).get(number).then(load)
    this.on('route', number => get(number))
  </script>
</organization-tag>

<organization-edit>

    <h4 if={item}>{item.name}</h4>
    <h4 if={object_id = 'create'}>Create Organization</h4>
    <a if={item.id} href="/#organizationdetail/{item.id}">Back</a>
    <a if={!item.id} href="/#organizationlist">Back</a>

    <form class="form-horizontal">
        <div class="form-group">
            <label for="organizationName" class="col-sm-3 control-label">Name</label>
            <div class="col-sm-6">
                <input ref="name"type="text" class="form-control" id="organizationName" placeholder="Organization Name" value={item.name}>
            </div>
            <div class="clearfix"></div>
        </div>

        

        <div class="form-group">
            <label for="organizationAcronym" class="col-sm-3 control-label">Acronym (en)</label>
            <div class="col-sm-2">
                <input ref="acronyms.en"  type="text" class="form-control" id="organizationAcronym" placeholder="acronynm" value={_.get(item, ['acronyms', 'en'], '')}>
            </div>
            <div class="clearfix"></div>
        </div>


        <div class="form-group">
            <label for="organizationType" class="col-sm-3 control-label">Type</label>
            <div class="col-sm-2">
                <select ref="type" class="form-control" id="organizationType">
                    <option 
                    each={option in options_for_type} 
                    value={option.id}
                    selected={option.id==item.type || (option.id=='NN' && !item.type)}
                    >
                    {option.name}
                    </option>
                </select>
            </div>
            <div class="clearfix"></div>
        </div>
        

        <div class="form-group">
            <label for="organizationContactDetails" class="col-sm-2 control-label">Contact Details</label>
            <div class="clearfix"></div>
        </div>
        

        <div class="form-group" each={method in contactMethods}>
            <label class="col-sm-2 col-sm-offset-1 control-label">{method}</label>
            <div class="col-sm-4">
                <div class="input-group">
                    <div class="input-group-addon" if={method == 'facebook'}>https://facebook.com/</div>

                    <input ref="contact.{method}" type="text" class="form-control" id="organizationAcronym" placeholder="No {method}" value={_.get(item, ['contact', method])}>
                    <span onclick={removeContactMethod} class="input-group-addon">x</span>
                </div>
            </div>
            <div class="clearfix"></div>
        </div>

        <div class="clearfix"></div>

    </form>

    <button type="button" onclick={save}>Save</button>

    <script>
        const tag = this
        const storeName = 'organization'
        declare const _;
        tag.item = {};
        tag.options_for_type = {};

        tag.save = (e) => {
            let store = stores.getStore(storeName);
            _.each(tag.refs, function(control, path){if (control.value){_.set(tag.item, path, control.value)}})
            store.store.save(tag.item).then(function(item){tag.update({item:item})})
        }
        declare const stores
        const load = (item) => tag.update({item: item})
        const addContactMethod = (e) => {
            const val = (e.target.value)
            _.set(this, ['item','contact', e.target.value], '')
            this.update()
        }
        const removeContactMethod = (e) => {
            _.unset(this, ['item','contact', e.item.method])
            this.update()
            }

        tag.addContactMethod = addContactMethod
        tag.removeContactMethod = removeContactMethod

        tag.on('mount', function(){
            /* Prepare select options for organisation type */
            let store = stores.getStore('lookup')
            store.group('organizationtypes').then(function(options){
                tag.update({options_for_type:options})
            })
            
        })

        const contactMethods = [
            'phone',
            'phone_secondary',
            'email',
            'fax',
            'facebook',
            'twitter',
        ]

        tag.contactMethods = contactMethods

        const get = (id) => {
            let item;
            this.object_id = id;
            if (id === 'create') {
                let item = stores.getStore(storeName).store.template()
                load(item);
            } else {
                stores.getStore(storeName).store.get(id).then(load)
                }
            
        }
        this.on('route', (id) => get(id))
        this.on('update', () => this.contactMethod = _.difference(contactMethods, _.keys(this.item.contact)))
    </script>

</organization-edit>


<testing-tag>
    <p>Hello World</p>
    <ul>
    <li each={thing in things}>{ thing.name } {thing.id} </li>
    </ul>
  <script>
    var tag = this;
    declare const stores;
    const storeName='organization';
    const load = (things) => tag.update({things: things})
    const get = () => stores.getStore(storeName).store.array().then(load)
    this.on('route', () => get())
  </script>

</testing-tag>