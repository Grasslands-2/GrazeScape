//-----------------------------------------------------
// DSS.components.LogoBar
//
//-----------------------------------------------------
Ext.define('DSS.components.LogoBar', {
    extend: 'Ext.container.Container',
    alias: 'widget.logobar',
    
    require: [
    	'DSS.components.Step4',
		'DSS.components.d3_nav'
	],
    
	style: "background: transparent",
	
	layout: {
		type: 'hbox',
		pack: 'start',
	},

	items: [{
		xtype: 'component',
		margin: '4 0 0 0',
		width: 290, 
		height: 74, // a fixed height improves page layout responsiveness unfortunately
		html: '<a href="/"><img id="ddd" src="assets/images/dss-logo-white.png" style="width:100%"></a>',
/*	},{
		xtype: 'component', 
		id: 'dss-selection-loading',
		margin: '-6 -56 -8 -8',
		width: 80, height: 80,
		style: 'opacity:0.8; position: absolute; background-image: url(assets/images/spinner-icon-gif-24.gif); background-size: cover;',
*/	},{
		xtype: 'container',
		layout: 'absolute',
		id: 'dss-selection-loading',
	//	margin: '0 -32 -8 -8',
		width: 16, height: 60,
		style: 'opacity: 0.8',
		defaults: {
			xtype: 'component',
			width: 60, height: 60,
			margin: '4 2'
		},
		items: [{
			y: 8,
			style: 'filter: blur(2px); opacity: 0.6; position: absolute; background: url(assets/images/dss-spinner-shadow.png); background-size: cover;',
			cls: 'spinner-rotate',
		},{
			style: 'animation: rotation 1s infinte linear; position: absolute; background: url(assets/images/dss-spinner.png); background-size: cover;',
			cls: 'spinner-rotate',
		}]
	},{
		xtype: 'd3_nav',
		itemId: 'd3-nav-bar',
		width: 960, 
		height: 66,
		padding: '10 0 0 32',
		DSS_tooltipOffset: [-64,-18],
		DSS_align: 'l',
		DSS_duration: 500.0,
		DSS_elements: [{
			text: 'Explore',
			active: true,
			activeText: 'Explore Landscape',
			tooltip: 'Find existing landscape matching selected attributes',
			DSS_selectionChanged: function(selected) {
				if (selected) {
				}
			}
		},{
			text: 'Transform',
			activeText: 'Transform the Landscape',
			tooltip: 'Alter the landcover in selected areas to create a user-scenario',
			DSS_selectionChanged: function(selected) {
				DSS_viewport.updateScenarioManager(selected)
			}
		},{
			id: 'dss-analyze-button',
			text: 'Analyze',
			activeText: 'Analyze Results',
			tooltip: 'Analyze the modeled outcomes from the user-chosen landscape changes',
			disabledTooltip: 'Transform the landscape to proceed',
			disabled: true,
			DSS_selectionChanged: function(selected) {
				DSS_viewport.positionAnalyzer(selected);
			}
		},{
			text: 'Next?',
			activeText: 'Step 4 (what next?) Mockup',
			tooltip: 'Dig a little deeper and explore meta-model outcomes',
			disabledTooltip: 'Transform the landscape to proceed',
			disabled: true,
			DSS_selectionChanged: function(selected) {
				if (selected) {
					Ext.create('DSS.components.Step4').show().center();
				}
			}
		},{
			text: 'Summary',
			activeText: 'Summarize Results',
			tooltip: 'Prepare a summary of my results',
			disabledTooltip: 'Transform the landscape to proceed',
			disabled: true,
			DSS_selectionChanged: function(selected) {
				if (selected) {
					Ext.Msg.alert("Summarize Results", "To be continued....")
				}
			}
		}]
	}],
	
	//--------------------------------------------------------------------------
	enableNavBar: function() {
		var me = this;
		me.getComponent('d3-nav-bar').enableAll();
	},
	
	//--------------------------------------------------------------------------
	clickAnalyze: function() {
		var me = this;
		me.getComponent('d3-nav-bar').clickElement('#dss-analyze-button');		
	}
	
});
