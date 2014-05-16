(function(exports){

var KityCharts = exports.KityCharts = kc.KityCharts = kity.createClass( 'KityCharts', {
    base : kc.Chart,

    constructor: function ( target, config ) {
        this.callBase( target );

        this.setData( new kc.ChartData( config ) );

        this._update( config );
    },

    _update : function( config ){

        // config 融合 处理
        var base = kc.ChartsConfig.init();
        var yAxisTmpl = base.yAxis;
        this.config = kity.Utils.deepExtend( base, config );


        // 读取yAxis配置
        var i, 
            yAxis =  config.yAxis,
            base, current, coordConf, tmpConf,
            oxy,
            yAxis = kity.Utils.isObject( yAxis ) ? [ yAxis ] : yAxis,
            series = config.series,
            type;

        // 遍历生成多个坐标轴
        for( i = 0; i < this.config.yAxis.length; i++ ){

            current = this.data.format( i );
            tmpConf = kity.Utils.deepExtend( base, current );


            tmpConf = kity.Utils.copy( tmpConf );
            tmpConf.yAxis = kity.Utils.deepExtend( yAxisTmpl, yAxis[ i ] );
            
            coordConf = kc.ChartsConfig.setCoordinateConf( tmpConf, i );
            oxy = this.addElement( 'oxy_' + i, new kc.CategoryCoordinate( coordConf ) );
            oxy.update();

            // 处理图表类型 series
            for( type in series[ i ] ){
                tmpConf.series = series[ i ];
                switch( type ) {
                    case 'line':
                    case 'area':
                        this.addElement( 'LinePlots_' + i, new kc.LinePlots( oxy, tmpConf, type ) ).update();
                        break;
                    case 'bar':
                    case 'column':
                        this.addElement( 'BarPlots_' + i, new kc.StickPlots( oxy, tmpConf, type ) ).update();
                        break;
                    default:
                        break;
                }
            }

        }


    }


} );

KityCharts = kity.Utils.extend( KityCharts, kc );

})( window );