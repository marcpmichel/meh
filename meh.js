
meh = {}

meh.ready = function(fun, ...args) {
  document.addEventListener("DOMContentLoaded", function(event) {
    fun.apply(fun, args)
  })
}

meh._views = {}

meh.view = function(viewId) {
  // console.log("seeking view " + viewId);
	return meh._views[viewId]
}

meh.addView = function(conf={}, parentEl) {
    const el = document.createElement('div')
    if(conf.id) el.id = conf.id;
    el.className = "view " + conf.class
    el.innerHTML = conf.html || ""
    if(el.width) el.style += `flex 0 0 ${width}`
    else if(el.height) el.style += `flex 0 0 ${height}`
    parentEl.appendChild(el)
    return el
}

meh.ui = {}
meh.declare = function( name, ...args) {
  return meh.ui[name] = Object.assign({}, ...args.reverse())
}

meh.eventable = {
	_events: {},
	_eventable: true,
  on: function(eventName, callback) {
    if(!this.el) return
    this.el.addEventListener(eventName, callback, false)
    this._events[eventName] = callback
  },
  no: function(eventName) {
    const callback = this._events[eventName]
    this.el.removeEventListener(eventName, callback, false)
		delete this._events[eventName]
  },
	_none: function(eventName) {
    Object.keys(this._events).forEach( k => this.no(k))
	}
}

meh.data = {
	_data: true
}

meh.uuid = function() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

meh.constructView = function(viewDef, parentEl) {
	if(!meh.ui[viewDef.view]) throw new Error(`"${viewDef.view}" : no such view`)
	const v = Object.create(meh.ui[viewDef.view]); // _.clone(meh.ui[viewDef.view])
	if(!viewDef.id) viewDef.id = meh.uuid(); // _.uniqueId('meh')
	if(meh._views[viewDef.id]) throw new Error(`view with id ${viewDef.id} already exist !`)
  
	v.init(viewDef)
	meh._views[viewDef.id] = v
  // console.log(meh._views);
	v.render(parentEl)
	return v
}

meh.build = function(viewDef={}, parentEl=document.body) {

  if(viewDef.cols) {
      const colEl = this.addView({id: viewDef.id, class:'cols'}, parentEl)
      viewDef.cols.forEach(function(def) {
        meh.build(def, colEl)
      })
  }
  else if(viewDef.rows) {
      const rowEl = this.addView({id: viewDef.id, class:'rows'}, parentEl)
      viewDef.rows.forEach(function(def) {
        meh.build(def, rowEl)
      })
  }
  else if(viewDef.view) {
    const v = meh.constructView(viewDef, parentEl)
		// if(viewDef.click && (typeof(viewDef.click) === 'function')) // _.isFunction(viewDef.click))
		// 	v.on('click', viewDef.click)
  }
  else {
     // throw new Error(`don't know how to build ${JSON.stringify(ui)}`)
     console.warn(`don't know how to build ${JSON.stringify(ui)}`)
  }
}


meh.declare("view", {
	init: function(config) { 
		this.config = config
		this.el = undefined
		this.parentEl = undefined
    this._views = {}
	},
  $addSubview: function(view) {
    this._views[view.id] = view;
  },
  render: function(parentEl) {
    this.el = meh.addView({html:'unkown view !'}, parentEl)
    this.parentEl = parentEl
  },
	destroy: function() { 
    if(this.el) this.parentEl.removeChild(this.el)
		if(this._eventable) this.none()
  }
})

meh.declare("template", {
  render: function(parentEl) {
    this.el = meh.addView({html: this.config.template, class:"template"}, parentEl)
		this.parentEl = parentEl
  },
  html: function(content) {
    this.el.innerHTML = content;
  }
}, meh.ui.view)

meh.declare("button", {
  render: function(parentEl) {
    this.el = meh.addView({html: this.config.label, class:'button'}, parentEl)
		this.parentEl = parentEl
  }
}, meh.ui.view, meh.eventable)

meh.declare("label", {
  render: function(parentEl) {
    this.el = meh.addView({html: this.config.label, class:'label autowidth'}, parentEl)
		this.parentEl = parentEl
  }
}, meh.ui.view)

meh.declare("header", {
	render: function(parentEl) {
		this.el = meh.addView({html: this.config.label, class:"header" }, parentEl);
		this.parentEl = parentEl;
	}
}, meh.eventable, meh.ui.view)

meh.declare("list", {
  render: function(parentEl) {
    this.el = meh.addView({ class:"list"}, parentEl)
		this.parentEl = parentEl
		var listEl = this.el;
		if(this.config.data) {
			const classes = this.config.select ? "item selectable" : "item";
      let item;
			this.config.data.forEach((item) => {
				item = meh.addView({id: item.id, html:item.value, class: classes}, listEl);
        if(this.config.select) {
          item.addEventListener('click', (evt) => {
            const newevent = new Event('itemclick');
            newevent.item_id = evt.target.id;
            this.el.dispatchEvent(newevent);
          });
        }
			});
		}
  }
}, meh.ui.view, meh.eventable)

meh.declare("menu", {
  render: function(parentEl) {
    this.el = meh.addView({class:"menu"}, parentEl)
    this.parentEl = parentEl;
    if(this.config.data) {
      const item_class = "menuitem selectable";
      let item;
      this.config.data.forEach((item) => {
        item = meh.addView({id: item.id, html: item.value, class: item_class}, this.el);
        item.addEventListener('click', (evt) => {
          const newevent = new Event('itemclick');
          newevent.item_id = evt.target.id;
          this.el.dispatchEvent(newevent);
        });
      });
    }
  }
}, meh.ui.view, meh.eventable);

meh.declare("tabs", {
  render: function(parentEl) {
    this._tabs = [];
    this.el = meh.addView({ class:"tabs"}, parentEl)
    this.parentEl = parentEl;

    if(this.config.tabs) {
      this.current = this.config.tabs[0].id;
      let item;
      this.config.tabs.forEach((tab) => {
        const classes = (tab.id == this.current) ? "tab tab-active" : "tab"; 
        item = meh.addView({id: tab.id, html: tab.label, class: classes}, this.el);
        item.addEventListener('click', (evt) => {
          const newevent = new Event('itemclick');
          newevent.item_id = evt.target.id;
          newevent.view_id = tab.view; 
          this.el.dispatchEvent(newevent);
        });
      });
    }
  }
}, meh.ui.view, meh.eventable);


meh.declare('multiview', {
  render: function(parentEl) {
    this.el = meh.addView({class:'multiview'}, parentEl);
    this.parentEl = parentEl;
    this.view_ids = [];

    if(this.config.views) {
      this.current_id = this.config.views[0].id;
      let item;
      this.config.views.forEach((view) => {
        item = meh.constructView(view, this.el);
        console.log(item);
        this.view_ids.push(view.id);
        if(view.id != this.current_id) item.el.style.display = 'none';
      });
    }
  },
  select(view_id) {
      this.view_ids.forEach((vid) => {
        let v = meh.view(vid);
        if(v) {
          v.el.style.display = (vid == view_id) ? 'block' : 'none';
        }
      });
  }
}, meh.ui.view);

