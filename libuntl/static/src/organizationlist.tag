<organizationlist>
<div class="row">
    <div class="col col-xs-9">
        <h3> Organizations Page </h3>
    </div>
    <div class="col col-xs-3">
        <a class="btn btn-xl btn-default" href="#organizationedit/create">Add an Organization</a>
    </div>
</div>

<div class="row">
    <div class="col col-md-3 col-sm-6 col-xs-12">
<form class="form-inline">
  <div class="form-group">
    <label for="SearchOrganizationName">Search</label>
    <input id="SearchOrganizationName" type="text" class="form-control" placeholder="Search for a name" oninput={search} value={searchstring}></input>
  </div>
</form>

    </div>
    <div class="col col-md-9 col-sm-6 col-xs-12">
<nav aria-label="Page navigation">
  <ul class="pagination" style="margin-top:0;">

    <li class="page-item">
      <a class="page-link" onclick={down} aria-label="Previous">
        <span aria-hidden="true" class={'disabled': down_disabled }>&laquo;</span>
        <span class="sr-only">Previous</span>
      </a>
    </li>

    <li class="page-item">
        <a class="page-link" aria-label="page Number">
            <span aria-hidden="true">Page {current_page} of {pages}</span>
            <span class="sr-only">Previous</span>
        </a>
    </li>

    <li class="page-item">
      <a class="page-link" onclick={up} aria-label="Previous">
        <span aria-hidden="true"  class={'disabled': up_disabled }>&raquo;</span>
        <span class="sr-only">Previous</span>
      </a>
    </li>
</ul>
</nav>
    </div>
</div>

    <div class="row">
        <div class="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xs-12 listitem" each={item in list}>
        <a href="/#organizationdetail/{item.id}">
            <div style="height:200px; border:1px solid black; border-radius: 5px; padding: 5px; overflow:hidden;">
                <div style="text-align:center; height:25%">
                    <h4>{_.invoke(item, 'get_name') || item.name}</h4>
                </div>
                <div style="height:75%;">
                    <img if="{item.logo}" src="/static/img/{item.logo}" height='100%' width='100%'>
                    <img if="{!item.logo}" src="/static/img/organisation_empty_logo.jpg" height='100%' width='100%'>
                </div>
            </div>
            </a>
        </div>
    </div>
    <style>
        .listitem {padding-bottom: 30px;}
        .listitem:hover {}
        span.disabled {color :gray;}
    </style>

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
        <route path=''>
            <h4>Welcome</h4>
        </route>

        <route path="organizationlist">
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
        <h1>{item.name}</h1>
        <h1><span class="small">{item.acronym}</span></h1>
                <img if="{item.logo}" src="/static/img/{item.logo}" height='200px' width='200px'>
                <img if="{!item.logo}" src="/static/img/organisation_empty_logo.jpg" height='200px' width='200px'>
            <h2>About</h2>
            
            <h2>Projects</h2>

            <h2>Publications and Resources</h2>
                <p if={!related || !related.resource || !related.resource.length}>
                There are no resources
                </p>
            <p if={related && related.resource} each={resource in related.resource}>
                <a href="#resourcedetail/{resource.id}">{resource.name.en}</a>
            </p>

            <h2>Contact</h2>
                <div class="col col-xs-12">
                    <div if={item && item.contact} class="row" each={i,j in item.contact}>
                        <div class="col col-xs-2"><strong>{j}</strong></div>
                        <div class="col col-xs-3">{i}</div>
                        <div class="clearfix"></div>
                    </div>
                </div>
        

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
        if (!item){tag.update({item: undefined, error: {message: 'Sorry, that organization might have been removed'}}); return}
        item.getRelated().then(function(related){tag.update({item: item, related:related});})
    }
    const get = (number) => stores.getStore(storeName).get(number).then(load)
    this.on('route', number => get(number))
  </script>
</organization-tag>

<organization-edit>

    <h4 if={item}>{item.name}</h4>
    <h4 if={object_id == 'create'}>Create Organization</h4>
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