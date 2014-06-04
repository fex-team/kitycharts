(function(){

var LinePlots = kc.LinePlots = kity.createClass( 'LinePlots', {
    base: kc.LinearPlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
    },

    plotsAttrsInit : function(){
        this.chartType = 'line';
    },

    getLineWidth : function(){
        return this.config.plotOptions.line.width;
    }

} );


})();