(function(){

var ColumnChart = kc.ColumnChart = kity.createClass( 'ColumnChart', {
    base: kc.StickChart,

    constructor: function ( target, param ) {
        this.chartType = 'column';
        this.callBase( target, param );
        var plots = this.addElement( 'plots', new kc.ColumnPlots() );
        this.setPlots( plots );
    },

    getTooltipPosition : function( val ){

        return {
            x : this.currentStick.param.x,
            y : this.coordinate.measurePointY( val )
        };

    }
} );


})();