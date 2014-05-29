(function(exports){

var KityCharts = exports.KityCharts = kc.KityCharts = kity.createClass( 'KityCharts', {
    base : kc.Chart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.config = this.param;
        this.setData( new kc.ChartData( param ) );

        this.coordinate = this.addElement( 'oxy', new kc.CategoryCoordinate() );
        this.plots = this.addElement( 'ColumnPlots', new kc.StickPlots() )
    },

    update : function( param ){
        var config = this.config = param || this.config

        var base = kc.ChartsConfig.init(),
            config = kity.Utils.deepExtend( base, config ),
            data, coordConf, plotsConf;

        param && this.setData( new kc.ChartData( config ) );

        data = this.data.format();
        this.config = kity.Utils.deepExtend( base, data );
        
        coordConf = kc.ChartsConfig.setCoordinateConf( this.config );

        this.coordinate.update( coordConf );
        // this.plots.update( this.coordinate, plotsConf );

    }


} );

})( window );