(function(exports){

var PieCharts = exports.PieCharts = kc.PieCharts = kity.createClass( 'PieCharts', {
    base : kc.Chart,

    constructor: function ( target, config ) {
        this.callBase( target );

        this.setData( new kc.PieData( config ) );

        this._update( config );
        // this._bindAction();
        this._addLegend();
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
        current = this.data.format( i );
        tmpConf = kity.Utils.deepExtend( base, current );

        tmpConf = kity.Utils.copy( tmpConf );
        tmpConf.yAxis = kity.Utils.deepExtend( yAxisTmpl, yAxis[ i ] );
        
        
        // 处理图表类型 series
        var p = this.addElement( 'PiePlots', new kc.PiePlots( tmpConf ) );
        p.update();


        this.hoverDots = this.addElement( 'hoverDots', new kc.ElementList() );
    },

    _bindAction : function(){

    },

    _addLegend : function(){
        var series = this.config.series,
            i, j, type, entries, entry, label, color, tmp;

        var legend = $('<div></div>').css({
            position : 'absolute',
            bottom : '0',
            left : this.config.xAxis.margin.left + 'px',
            height : '26px',
            lineHeight : '26px'
        }).appendTo( this.container );

        for ( i = 0; i < 1; i++ ) {
            
            entries = series[ i ];
            
            for ( j = 0; j < entries.data.length; j++ ) {
                entry = entries.data[ j ];

                label = entry.name;
                color = entry.color || this.config.color[ j ] || this.config.finalColor;

                tmp = $('<div></div>').css({
                    marginRight : '20px',
                    display : 'inline-block'
                }).appendTo( legend );

                $('<div class="kitycharts-legend-color"></div>').css({
                    width : '12px',
                    height : '12px',
                    backgroundColor : color,
                    display : 'inline-block',
                    marginRight : '5px',
                    position: 'relative',
                    top: '1px'
                }).appendTo( tmp );

                $('<div class="kitycharts-legend-label">' + label + '</div>').css({
                    fontSize : '10px',
                    display : 'inline-block'
                }).appendTo( tmp );

            }

        }


    }

} );


})( window );