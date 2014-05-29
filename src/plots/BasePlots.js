(function(){

var BasePlots = kc.BasePlots = kity.createClass( 'BasePlots', {
    base: kc.ChartElement,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
        this.coordinate = coordinate;
        this.config = config;

        this.plotsElements = this.addElement( 'plotsElements', new kc.ElementList() );

        this.plotsAttrsInit();
    },

    getPlotsElements : function(){
        return this.plotsElements;
    },

    update: function ( coordinate, config ) {
        this.coordinate = coordinate || this.coordinate;
        this.config = config || this.config;

        this.drawPlots( this.coordinate, this.config );
    },

} );


})();