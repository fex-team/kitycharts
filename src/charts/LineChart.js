(function(){

var LineChart = kc.LineChart = kity.createClass( 'LineChart', {
    base: kc.BaseChart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        var plots = this.addElement( 'plots', new kc.LinePlots() );
        this.setPlots( plots );
    }

} );


})();