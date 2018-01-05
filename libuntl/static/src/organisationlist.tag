<organisationlist>

    <input oninput={search}></input>
    <button onclick={foo}>Refresh</button>
    <button onclick={up}>Up</button>
    <button onclick={down}>Down</button>

    <div class="row">
    {current_page} / {pages}
        <div class="col-xs-3" each={item in list}>{item.name}</li>
    </ul>

    <script>
        var tag = this;
        var Store = tag.store = undefined;
        tag.list = [];
        tag.order = {};

        tag.on('mount', function(){console.log('Hello World a')})

        tag.page = function(){tag.update({list: tag.store.page()})}
        tag.up = function(){tag.update({list: tag.store.page_up()})}
        tag.down = function(){tag.update({list: tag.store.page_down()})}
        tag.search = function(e){
            tag.update({list: tag.store.search(e.target.value)})
            }
        
        tag.set_store = function(store){
            tag.store = store;
            tag.store.on('page_changed', function(){
                debugger;
                tag.update({
                    list: tag.store.items, 
                    pages:tag.store.pages(),
                    current_page: tag.store.current_page()
                    })
            })
        }

    </script>
</organisationlist>