(function(){

var AreaChart = kc.AreaChart = kity.createClass( 'AreaChart', {
    base: kc.BaseChart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        var plots = this.addElement( 'plots', new kc.AreaPlots() );
        this.setPlots( plots );
    }

} );


})();