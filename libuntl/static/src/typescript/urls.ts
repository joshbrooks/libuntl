export enum Method {
	get,
	put,
	post,
	delete,
	head,
}


class Url {
	/* Exposes a Django URL endpoint */
	url: string;
	actions: Method[];
	constructor() {
	}
	post (Object){
		return 
		/* await post */
	}
	get (Object){
		return 
		/* await get */
	}
	
	delete (Object){
		return 
		/* await delete */
	}
}

class DRFUrl extends Url {
	app: string;
	model: string;
	constructor (_app:string, _model:string, _actions: Method[]){
        super()
		this.app = _app;
		this.model = _model;
		this.actions = _actions;
	}
}

class UrlStore {
    urls: Url[] = [];
	_register(url: Url) {
		this.urls.push(url)
	}
}

export class DRFUrlStore extends UrlStore {
    urls: DRFUrl[];
    register(_app:string, _model:string, _actions: Method[]) {
        this._register(new DRFUrl(_app, _model, _actions))
	}
	constructor(){
		super()
	}
}