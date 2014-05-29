(function(){

var ColumnChart = kc.ColumnChart = kity.createClass( 'ColumnChart', {
    base: kc.BaseChart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        var plots = this.addElement( 'plots', new kc.ColumnPlots() );
        this.setPlots( plots );
    }

} );


})();