(function(exports){

var PieChart = kc.PieChart = kity.createClass( 'PieChart', {
    base : kc.BaseChart,

    constructor: function ( target, param ) {
        this.chartType = 'pie';
        this.callBase( target, param );
        this.config = this.param;
        this.setData( new kc.PieData( param ) );

        var plots = this.addElement( 'plots', new kc.PiePlots() );
        this.setPlots( plots );

        // this.bindAction();
        // this.addLegend();
    },

    update : function( param ){
        this.setConfig( param, kc.PieData );
        
        this.getPlots().update( this.config );
        this.getOption('legend.enabled') && this.addLegend();
    },

    getCenter : function(){
        var center = this.config.plotOptions.pie.center;
        return {
            x : center.x,
            y : center.y
        };
    },

    getSeries : function(){
        return this.config.series;
    },

    bindAction : function(){

    },

} );


})( window );