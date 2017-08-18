
meh = {}

meh.ready = function(fun, ...args) {
  document.addEventListener("DOMContentLoaded", function(event) {
    fun.apply(fun, args)
  })
}

meh.init = function() {
    this._views = {}
    this._initialized = true
}
meh.addView = function(conf={}, parentEl) {
    const el = document.createElement('div')
    el.className = "view " + conf.class
    el.innerHTML = conf.html || ""
    if(el.width) el.style += `flex 0 0 ${width}`
    else if(el.height) el.style += `flex 0 0 ${height}`
    parentEl.appendChild(el)
    return el
}

meh.ui = {};

meh.ui.View = {
  
}

meh.ui.button = _.extend({
  
}, meh.ui.View)

meh.build=function(ui={}, parentEl=document.body) {
  if(!meh._initialized) meh.init()

  if(ui.cols) {
          const colEl = this.addView({class:'cols'}, parentEl)
          ui.cols.forEach(function(def) {
            meh.build(def, colEl)
          })
  }
  else if(ui.rows) {
          const rowEl = this.addView({class:'rows'}, parentEl)
          ui.rows.forEach(function(def) {
            meh.build(def, rowEl)
          })
  }
  else if(ui.view) {
      switch(ui.view) {
        case 'template': 
          this.addView({html: ui.template, class:"template"}, parentEl)
        break
        case 'button':
          this.addView({html: ui.label, class:'button'}, parentEl)
        break
        case 'label':
          this.addView({html: ui.label, class:'label autowidth'}, parentEl)
        break
        case 'list':
          this.addView({ class:"list"}, parentEl)
        break
        default:
          this.addView({html:'unkown view !'}, parentEl)
        break
      }
   }
   else {
    this.addView({}, parentEl)
   }
}
meh.init()



