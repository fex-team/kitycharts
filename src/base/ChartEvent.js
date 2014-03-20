var ChartEvent = kc.ChartEvent = kity.createClass( "ChartEvent", {
    constructor: function ( target, kityEvent ) {
        if ( kityEvent ) {
            this.kityEvent = kityEvent;
        }
        this.target = target;
    }
} );