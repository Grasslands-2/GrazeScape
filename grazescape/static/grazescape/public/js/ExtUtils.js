//-----------------------------------------------------
// DSS.utils
//
//-----------------------------------------------------
Ext.define('DSS.utils', {
    extend: 'Ext.Base',
    
	statics: {
		constants: {
			DEFAULT_LANE_WIDTH_FT: 12,
		},
		
		layout: function(type, pack, align) {
			return {
				type: type,
				pack: pack || undefined,
				align: align || undefined
			}
		},
		
		// Quicktip singleton config overrides do not cover a few options I want globally...
		tooltip: function(text) {
			return {
				text: text,
	            trackMouse: false,
	            defaultAlign: 'b50-t50',
	            anchor: true,
	            showDelay: 250,
			}
		},
		
		addStyle: function(entry) {
			let style = document.createElement('style');
			style.type = 'text/css';
			style.innerHTML = entry;
			document.getElementsByTagName('head')[0].appendChild(style);
		},		

		calculateInfrastructureCost(infraType, length, costPerFoot, laneWidth) {
			console.log("Calculating infrastructure cost:")
			console.log(infraType, length, costPerFoot, laneWidth)
			switch(infraType) {
				case 'll': // Lane
					return (length * costPerFoot * laneWidth).toFixed(2);
				case 'fl': // Fence
				case 'wl': // Water
					return (length * costPerFoot).toFixed(2);
				default:
					console.error("Unknown infrastructure type: ", infraType);
					return 0;
			}
		}
	},
		
});

//--------------------------------------------------------------------------
Ext.define('AppEvents', {
	extend: 'Ext.Base',
    singleton: true,	
    
	_events: {},
	
	//--------------------------------------------------------------------------
	constructor: function () {
	},

	// WARNING: listeners on temporary objects must clean themselves up!
	// returns 'handle' to added listener for removal later
	//--------------------------------------------------------------------------
	registerListener: function(eventName, eventProcessor, scope) {
		
		var event = {
			processor: eventProcessor,
			scope: scope
		};
		
		var res = this._events[eventName];
		var id = Ext.id();
		if (res) {
			// already have an event array set up for a given event name so append to that array
			res[id] = event;
		}
		else {
			// first event name so add the event name to the master list and 
			//	tie an array of event processors to it (with our first event handler in it)
			var ar = new Object();
			ar[id] = event;
			this._events[eventName] = ar;
		}
		
		return {
			eventName: eventName,
			id: id
		}
	},

	// Takes the handle returned when the listener was registered.
	//	NO SAFETY CHECKING...
	//--------------------------------------------------------------------------
	removeListener: function(registeredHandle) {
		
		var res = this._events[registeredHandle.eventName];
		if (res) {
		//	console.log(' an item was removed from the listener', registeredHandle);
			delete res[registeredHandle.id];
		}
	},

	// jsonData is optional and could be encoded as an object. The reciever of the
	//	event is responsible for decoding and processing the data
	//--------------------------------------------------------------------------
	triggerEvent: function(eventName, jsonData) {

		var res = this._events[eventName];
		if (res) {
			for (var key in res) {
				var evt = res[key];
				if (evt && evt.processor) {
					evt.processor.call(evt.scope, jsonData);
				}
			}
		}
	}
	
});