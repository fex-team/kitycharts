var ChartsConfig = kc.ChartsConfig = {

    defaultConfigs : {
        line : kc.LineChartDefaultConfig,
        barColumn : kc.BarColumnChartDefaultConfig
    },

    mix : function( param ) {
        
    },

    setCoordinateConf : function( conf ) {
        var reuslt = {},
            components = [];

        var xAxis = conf.xAxis,
            yAxis = conf.yAxis,
            tmp;

        // 组件
        xAxis.axis.enabled && components.push( 'xAxis' );
        xAxis.ticks.enabled && components.push( 'xMesh' );
        xAxis.label.enabled && components.push( 'xCat' );
        yAxis.axis.enabled && components.push( 'yAxis' );
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
        
        return reuslt;
    }
};