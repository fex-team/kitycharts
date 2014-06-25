(function(){

var LineChart = kc.LineChart = kity.createClass( 'LineChart', {
    base: kc.LinearChart,

    constructor: function ( target, param ) {
    	this.chartType = 'line';
        this.callBase( target, param );
        var plots = this.addElement( 'plots', new kc.LinePlots() );
        this.setPlots( plots );
    },

} );


})();