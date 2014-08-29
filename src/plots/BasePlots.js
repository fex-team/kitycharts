(function(){

var BasePlots = kc.BasePlots = kity.createClass( 'BasePlots', {
    base: kc.ChartElement,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
        this.coordinate = coordinate;
        this.config = config || {};

        this.plotsElements = this.addElement( 'plotsElements', new kc.ElementList() );

        this.plotsAttrsInit();
    },

    getPlotsElements : function(){
        return this.plotsElements;
    },

    getEntryColor : function( entry, index ){
        var obj = entry.style && entry.style[ index ];
        if( obj && obj.color ){
            return obj.color;
        }
        return entry.color || this.config.color[ entry.index ] || this.config.finalColor;
    },

    update: function ( coordinate, config ) {
        this.coordinate = coordinate || this.coordinate;
        this.config = kity.Utils.extend( this.config, config );

        this.drawPlots( this.coordinate, this.config );
    },

} );


})();