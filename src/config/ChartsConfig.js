var ChartsConfig = kc.ChartsConfig = {

    defaultConfigs : {

        chart  : kc.Config.chart,
        line   : kc.Config.line,
        bar    : kc.Config.bar,
        column : kc.Config.column

    },

    init : function(){
        var chart = this.defaultConfigs.chart;
        for( var i in this.defaultConfigs ){
            if( i !== 'chart' ){
                chart = kity.Utils.deepExtend( chart, this.defaultConfigs[ i ] );
            }
        }

        return kity.Utils.copy( chart );
    },

    setCoordinateConf : function( conf ) {
        var reuslt = {
                dataSet: conf,
            },
            components = [];

        var xAxis = conf.xAxis,
            yAxis = conf.yAxis,
            tmp;

        // 组件
        xAxis.axis.enabled  && components.push( 'xAxis' );
        xAxis.ticks.enabled && components.push( 'xMesh' );
        xAxis.label.enabled && components.push( 'xCat' );
        yAxis.axis.enabled  && components.push( 'yAxis' );
        yAxis.ticks.enabled && components.push( 'yMesh' );
        yAxis.label.enabled && components.push( 'yCat' );
        reuslt.components = components;

        // 外部空隙
        var xm = xAxis.margin,
            ym = yAxis.margin;
        reuslt.margin = {
            left   : xm.left || 0,
            right  : xm.right || 0,
            top    : ym.top || 0,
            bottom : ym.bottom || 0
        };

        // 内部空隙
        var xp = xAxis.padding,
            yp = yAxis.padding;
        reuslt.padding = {
            left   : xp.left || 0,
            right  : xp.right || 0,
            top    : yp.top || 0,
            bottom : yp.bottom || 0
        };

        // 指定刻度最小值
        var minY = kity.Utils.queryPath('yAxis.min', conf);
        if( kity.Utils.isNumber( minY ) ){
            pass['minY'] = minY;
        }

        // 指定范围
        conf.rangeX && (reuslt.rangeX = conf.rangeX);
        conf.rangeY && (reuslt.rangeY = conf.rangeY);
            
        // categories 判断
        if( conf.chart.type == 'bar' ){
            delete( conf.xAxis.categories );
        }else{
            delete( conf.yAxis.categories );
        }

        return reuslt;
    }
    
};