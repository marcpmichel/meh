
ui = {};
ui.toolbar = { cols: [
  { view:'header', label:'Title' },
  { view:'button', label:'Click' },
  { view:'label', label: 'I am a label' }
]}

ui.col2 = { view:'layout', rows: [
  { view:'template', template:'two'},
  { view:'layout', cols:[
    { view:'template', template:'three'},
    { view:'template', template:'four'}
  ]}
]}


ui.col1 = { rows: [
  ui.toolbar,
  { view:'template', template:'one'}
]}


ui.list = { id:'list', view:'list', select: true,
  data:[ 
		{id:1, value:"One"},
		{id:2, value:"Two"},
		{id:3, value:"Three"},
		{id:4, value:"Four"},
		{id:5, value:"Five"}
	]
}

ui.col3 = { rows: [
	{ id:'h1', view:'header', label: 'This is a list' },
	ui.list,
  { id:'template', view:'template', template:'hey' }
]}

ui.layout = { view:'layout', cols: [
  ui.col1, ui.col3, ui.col2
]}

ui.menu = { id:'menu', view: 'menu', data: [
   { id: 1, value:"Item 1" },
   { id: 2, value:"Item 2" },
   { id: 3, value:"Item 3" },
]};

ui.menutest = { rows: [
  { view: 'header', label: 'This is a menu' },
  ui.menu
]};

ui.tabs = { id:'tabs', view: 'tabs', tabs: [
  { id: 'tab1', label: 'Tab1', view:'mv1' },
  { id: 'tab2', label: 'Tab2', view:'mv2' },
  { id: 'tab3', label: 'Tab3', view:'mv3' },
]};


/*
ui.mv2 = { id: 'mv2', view:'layout', cols: [
   { view:'label', label: 'View 2' }
]};

ui.mv3 = { id: 'mv3', view:'layout', cols: [
  { view:'button', label: 'View 3' }
]};
*/

ui.multiview = { id: 'multiview', view:'multiview', views: [
  { id:'mv1', view:'template', template:'<span style="font-size: 14pt; background-color: red;">view 1</span>' },
  { id:'mv2', view:'template', template:'<span style="font-size: 14pt; background-color: green;">view 2</span>' },
  { id:'mv3', view:'template', template:'<span style="font-size: 14pt; background-color: blue;">view 3</span>' },
]};

ui.tabstest = { rows: [
  { view: 'header', label: 'This is some tabs' },
  ui.tabs,
  ui.multiview
]};

meh.ready(function() {
  meh.build({cols: [ui.col3, ui.menutest, ui.tabstest] })

  meh.view('h1').on('click', function() { alert("clicked on header") });
  meh.view('menu').on('itemclick', function(evt) { 
    console.log("clicked on menu item " + evt.item_id); });
  meh.view('list').on('itemclick', function(evt) {
     console.log("clicked on list item " + evt.item_id); });
  meh.view('tabs').on('itemclick', function(evt) {
    console.log("clicked on tab " + evt.item_id); 
    meh.view('multiview').select(evt.view_id);
  });


  setInterval(() => {
    const content = (new Date()).toISOString();
     meh.view('template').html(content);
  }, 1000);

});


