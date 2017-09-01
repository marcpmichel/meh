
ui = {};
ui.toolbar = { cols: [
  { view:'label', label:'Title' },
  { view:'button', label:'Click', click:function() { alert('clicked') } }
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


ui.list = { view:'list', select: true,
  data:[ 
		{id:1, value:"One"},
		{id:2, value:"Two"},
		{id:3, value:"Three"},
		{id:4, value:"Four"},
		{id:5, value:"Five"}
	],
	click: function() { console.log('click on list'); }
}

ui.col3 = { rows: [
	{ view:'header', label: 'This is a list' },
	ui.list
]}

ui.layout = { view:'layout', cols: [
  ui.col1, ui.col3, ui.col2
]}


meh.ready(function() {
  meh.build(ui.layout)
});


