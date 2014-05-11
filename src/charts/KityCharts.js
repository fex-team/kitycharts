(function(exports){

var KityCharts = exports.KityCharts = kc.KityCharts = kity.createClass( 'KityCharts', {

    constructor: function ( target, data ) {

        this.target = target;

        this.update( data );
    },

    update : function( data ){

        var target = this.target;
        if ( typeof ( target ) == 'string' ) {
            target = document.getElementById( target );
        }
        target.innerHTML = '';

        this.chartType = kity.Utils.queryPath( 'chart.type', data );

        var chart;

        switch( this.chartType ){
            case 'line':
                chart = new kc.LineChart( this.target );
                break;
            case 'bar':
            case 'column':
                chart = new kc.BarChart( this.target );
                break;
            default:
                throw(new Error('KityCharts type can not be resolved.'))
                break;
        }

        
        this.chart = chart;
        chart.getData().update( data );

    }

} );

KityCharts = kity.Utils.extend( KityCharts, kc );

})( window );