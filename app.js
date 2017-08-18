
ui = {};
ui.toolbar = { cols: [
  { view:'label', label:'Title' },
  { view:'button', label:'Click' }
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

ui.list = { view:'list', 
  data:[ {id:1, value:"One"}, {id:2, value:"Two"}, {id:3, value:"Three"} ]
}

ui.layout = { view:'layout', cols: [
  ui.col1, ui.list, ui.col2
]}


meh.ready(function() {
  meh.build(ui.layout)
});


