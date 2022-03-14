
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

meh.addView = function(conf={}, parentEl, elem='div', elemtype) {
    const el = document.createElement(elem);
    if(conf.id) el.id = conf.id;
    if(conf.hidden) el.style.display = 'none';
    if(conf.display) el.style.display = conf.display;
    el.className = "view " + conf.class;
    el.innerHTML = conf.html || "";
    if(elemtype) el.type = elemtype;
    if(el.width) el.style += `flex 0 0 ${width}`;
    else if(el.height) el.style += `flex 0 0 ${height}`;
    parentEl.appendChild(el);
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
  dispatch: function(eventName, payload={}) {
    if(this._events[eventName]) this._events[eventName](payload);
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
    this._shown = false;
	},
  $addSubview: function(view) {
    this._views[view.id] = view;
  },
  $add(conf, parentEl, elem, elemtype) {
    this.el = meh.addView(conf, parentEl, elem, elemtype);
    if(!this.config.hidden) this.show();
    this.parentEl = parentEl;
  },
  render: function(parentEl) {
    this.el = meh.addView({html:'unkown view !'}, parentEl)
    this.parentEl = parentEl
  },
	destroy: function() { 
    if(this.el) this.parentEl.removeChild(this.el)
		if(this._eventable) this.none()
  },
  show: function() {
    if(this._shown) return;
    this._shown = true;
    this.el.style.display = 'block';
    // const newevent = new Event('show');
    // newevent.id = this.id;
    // this.el.dispatchEvent(newevent);
    this.dispatch('show', { id: this.id });
  },
  hide: function() {
    if(!this._shown) return; 
    this._shown = false;
    this.el.style.display = 'none';
    // const newevent = new Event('hide');
    // newevent.id = evt.target.id;
    // this.el.dispatchEvent(newevent);
    this.dispatch('hide', { id: this.id });
  }
}, meh.eventable);

meh.declare("template", {
  render: function(parentEl) {
    this.$add({html: this.config.template, class:"template"}, parentEl);
  },
  html: function(content) {
    this.el.innerHTML = content;
  }
}, meh.ui.view )

meh.declare("button", {
  render: function(parentEl) {
    this.$add({html: this.config.label, class:'button'}, parentEl);
  }
}, meh.ui.view )

meh.declare("label", {
  render: function(parentEl) {
    this.$add({html: this.config.label, class:'label autowidth'}, parentEl);
  }
}, meh.ui.view)

meh.declare("header", {
	render: function(parentEl) {
		this.$add({html: this.config.label, class:"header", height:'24px' }, parentEl);
	}
}, meh.ui.view)

meh.declare("list", {
  render: function(parentEl) {
    this.$add({ class:"list"}, parentEl);
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
}, meh.ui.view );

meh.declare('config', {
  render: function(parentEl) {
    this.$add({class:'config'}, parentEl);
    this.update(this.config.data);
  },
  clear() {
    this.el.innerHTML = '';
  },
  update(fields) {
    this.clear();
    if(fields) {
      fields.forEach((f) => {
         const row = meh.addView({class: 'configitem', display:'table-row'}, this.el, 'div'); 
         meh.addView({html: f.name, class: 'configitemname', display:'table-cell'}, row, 'div');
         meh.addView({html: f.value, class: 'configitemvalue', display:'table-cell'}, row, 'div');
      });
    }
  }
}, meh.ui.view );


meh.declare("menu", {
  render: function(parentEl) {
    this.$add({class:"menu"}, parentEl);
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
}, meh.ui.view );

meh.declare("tabs", {
  render: function(parentEl) {
    this._tabs = [];
    this.$add({ class:"tabs"}, parentEl);

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
}, meh.ui.view );


meh.declare('multiview', {
  render: function(parentEl) {
    this.$add({class:'multiview'}, parentEl);
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

meh.declare('form', {
  render: function(parentEl) {
    this.$add({class:'form'}, parentEl);
    this.fields(this.config.fields);
  },
  fields(fieldsDef) {
    this._fields = {};
    while (this.el.firstChild) { this.el.firstChild.remove(); }

    if(!Array.isArray(fieldsDef)) return;

    fieldsDef.forEach((f) => {
      const container = this.config.inline ? meh.addView({class:'formfieldcontainer'}, this.el) : this.el;
      const label = meh.addView({class:'formfieldlabel'}, container);
      label.innerHTML = f.name;
      switch(f.type) {
        case 'string': this._fields[f.name] = meh.addView({class:'formfieldvalue'}, container, 'input', 'text'); break;
        case 'text': this._fields[f.name] = meh.addView({class:'formfieldvalue'}, container, 'textarea'); break;
        case 'number': this._fields[f.name] = meh.addView({class:'formfieldvalue'}, container, 'input', 'number'); break;
        default: meh.addView({}, container); break;
      }
    });

    if(this.config.submit != false) {
      const formsubmit = meh.addView({class:'formsubmit'}, this.el);
      // const submitbutton = meh.addView({class:'formsubmitbutton', html:'Submit', width: '50px'}, formsubmit, 'button');
      const submitbutton = meh.constructView({view: 'button', label:'Submit' }, formsubmit);
      submitbutton.on('click', () => {
        const res = Object.keys(this._fields).map((k) => { return {name: k, value: this._fields[k].value } });
        console.log(res);
        // dispatch submit event
        this.dispatch('submit', res);
      });
    }
  }
}, meh.ui.view);

