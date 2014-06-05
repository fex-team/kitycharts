var ChartsConfig = kc.ChartsConfig = {

    defaultConfigs : {

        base    : kc.Config.base,
        area    : kc.Config.area,
        line    : kc.Config.line,
        bar     : kc.Config.bar,
        column  : kc.Config.column,
        scatter : kc.Config.scatter
    },

    init : function(){
        var base = this.defaultConfigs.base, mix;
        for( var i in this.defaultConfigs ){
            if( i !== 'chart' ){
                mix = kity.Utils.deepExtend( base, this.defaultConfigs[ i ] );
            }
        }

        return kity.Utils.copy( mix );
    },

    setCoordinateConf : function( conf, index ) {
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
        var minX = kity.Utils.queryPath('xAxis.min', conf);
        if( kity.Utils.isNumber( minX ) ){
            reuslt['minX'] = minX;
        }
        var minY = kity.Utils.queryPath('yAxis.min', conf);
        if( kity.Utils.isNumber( minY ) ){
            reuslt['minY'] = minY;
        }

        // 指定范围
        conf.rangeX && (reuslt.rangeX = conf.rangeX);
        conf.rangeY && (reuslt.rangeY = conf.rangeY);

        // label位置
        reuslt.yLabelsAt = yAxis.label.at || ( index > 0 ? "right" : "left" );
        reuslt.labelMargin = yAxis.label.margin || 10;

        // categories 判断
        if( yAxis.inverted ){
            conf.yAxis.categories = conf.xAxis.categories;
            delete( conf.xAxis.categories );
        }else{
            delete( conf.yAxis.categories );
        }


        reuslt.xLabelRotate = xAxis.label.rotate;
        reuslt.yLabelRotate = yAxis.label.rotate;

        reuslt.x = kity.Utils.queryPath('xAxis.margin.left', conf) || 0;
        reuslt.y = kity.Utils.queryPath('yAxis.margin.top', conf) || 0;

        return reuslt;
    }
    
};