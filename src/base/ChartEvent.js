var ChartEvent = kc.ChartEvent = kity.createClass( "ChartEvent", {
    constructor: function ( target, kityEvent ) {
        if ( kityEvent ) {
            this.kityEvent = kityEvent;
        }
        this.target = target;
    },

    getTargetChartElement: function() {
    	var shape = this.kityEvent.targetShape;

    	while(shape && !shape.host) {
    		shape = shape.container;
    	}

    	return shape.host;
    }
} );