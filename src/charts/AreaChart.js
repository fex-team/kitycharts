(function(){

var AreaChart = kc.AreaChart = kity.createClass( 'AreaChart', {
    base: kc.LinearChart,

    constructor: function ( target, param ) {
    	this.chartType = 'area';
        this.callBase( target, param );
        var plots = this.addElement( 'plots', new kc.AreaPlots() );
        this.setPlots( plots );
    },

} );


})();