
Ext.define('DSS.results.test_window',{
	initComponent: function() {
	DSS_chart_data = 2000
	DSS.BarGraph1  = new Ext.form.Panel({
            width: 500,
            height: 400,
            title: 'Foo',
            floating: true,
            closable : true
        });
},
testFire(){
    console.log("hello")
}

});
