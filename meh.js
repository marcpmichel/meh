
meh = {}

meh.ready = function(fun, ...args) {
  document.addEventListener("DOMContentLoaded", function(event) {
    fun.apply(fun, args)
  })
}

meh._views = {}
meh._inits = {}

meh.addView = function(conf={}, parentEl) {
    const el = document.createElement('div')
    el.id = conf.id
    el.className = "view " + conf.class
    el.innerHTML = conf.html || ""
    if(el.width) el.style += `flex 0 0 ${width}`
    else if(el.height) el.style += `flex 0 0 ${height}`
    parentEl.appendChild(el)
    return el
}

meh.ui = {}
meh.declare = function( name, ...args) {
  // this._inits[name] = _.compact(_(args).reverse().map( o => o.init ))
  // console.log(this._inits);
  return meh.ui[name] = _.defaults.apply(this, args)
}

/*
meh.renderable = {
  init: function(config) {
    this._renderable = true;
  },
  render: function(parentEl) {
    this.el = meh.addView({html:'unkown view !'}, parentEl)
  }
}
*/

meh.eventable = {
  init: function(config) {
    this._eventable = true;
    this._events = {}
  },
  on: function(eventName, callback) {
    if(!this.el) return;
    this.el.addEventListener(eventName, callback, false)
    this._events[eventName] = callback;
  },
  no: function(eventName) {
    const callback = this._events[eventName];
    this.el.removeEventListener(eventName, callback, false)
  }
}

meh.constructView = function(viewDef, parentEl) {
      if(!meh.ui[viewDef.view]) throw new Error(`"${viewDef.view}" : no such view`)
      const v = _.clone(meh.ui[viewDef.view])
      if(!viewDef.id) viewDef.id = _.uniqueId('meh')
      if(meh._views[viewDef.id]) throw new Error(`view with id ${viewDef.id} already exist !`)

      // console.log(viewDef.view, meh._inits[viewDef.view]);
      // if(meh._inits[viewDef.view]) meh._inits[viewDef.view].forEach( initFunc => initFunc.call(viewDef) )
      v.init(viewDef)
      meh._views[viewDef.id] = v
      v.render(parentEl)
}

meh.build=function(viewDef={}, parentEl=document.body) {

  if(viewDef.cols) {
          const colEl = this.addView({class:'cols'}, parentEl)
          viewDef.cols.forEach(function(def) {
            meh.build(def, colEl)
          })
  }
  else if(viewDef.rows) {
          const rowEl = this.addView({class:'rows'}, parentEl)
          viewDef.rows.forEach(function(def) {
            meh.build(def, rowEl)
          })
  }
  else if(viewDef.view) {
    meh.constructView(viewDef, parentEl)
  }
  else {
     // throw new Error(`don't know how to build ${JSON.stringify(ui)}`);
     console.warn(`don't know how to build ${JSON.stringify(ui)}`);
  }
}


meh.declare("view", {
	init: function(config) { this.config = config; this.el = undefined; this.parentEl = undefined; },
  render: function(parentEl) {
    this.el = meh.addView({html:'unkown view !'}, parentEl)
    this.parentEl = parentEl
  },
	destroy: function() { 
    if(this.el) this.parentEl.removeChild(this.el)
  }
} /* , meh.renderable */ )

meh.declare("template", {
  render: function(parentEl) {
    meh.addView({html: this.config.template, class:"template"}, parentEl)
  }
}, meh.ui.view)

meh.declare("button", {
  render: function(parentEl) {
    meh.addView({html: this.config.label, class:'button'}, parentEl)
  }
}, meh.ui.view, meh.eventable)

meh.declare("label", {
  render: function(parentEl) {
    meh.addView({html: this.config.label, class:'label autowidth'}, parentEl)
  }
}, meh.ui.view)

meh.declare("list", {
  render: function(parentEl) {
    meh.addView({ class:"list"}, parentEl)
  }
}, meh.ui.view)




