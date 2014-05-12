var ChartFrame = kc.ChartFrame = kity.createClass( 'ChartFrame', {
    base: kc.Chart,

    constructor: function ( target, config ) {
        this.config = config;

        this.callBase( target, param );//这里的param指的是图表外观的配置，目前没有用到，暂时默认为undefined，对外不暴露，全部采用默认样式

        var coordConf = kc.ChartsConfig.setCoordinateConf( config );
        var oxy = this.addElement( 'oxy', new kc.CategoryCoordinate( coordConf ) );

        // this.indicatrix =  this.addElement( 'indicatrix', new kc.Line({
        //     color : config.indicatrix.color,
        //     width : config.indicatrix.width,
        //     dash : config.indicatrix.dash,
        //     y1 : 0,
        //     y2 : oxy.param.height + oxy.param.y,
        // }) );
    },

    update: function () {
        var param = this.param;
        var data = this.currentData = this.data.format();

        var oxy = this.coordinate = this.drawOxy( param, data );
        
        // this.coordinate.update(param);

        // this.updateIndicatrix(-100, 0);

        // this.addLegend( data, oxy );

    },

    // updateIndicatrix : function(pX, pY){
    //     this.indicatrix.update({
    //         x1 : pX,
    //         x2 : pX,
    //         y1 : 0,
    //         y2 : pY
    //     });        
    // },

    drawOxy: function ( param, data ) {
        var oxy = this.getElement( 'oxy' );

        var pass = {
            dataSet: data,
            // formatX: appendUnit( data.unit_x ),
            // formatY: appendUnit( data.unit_y )
        }

        var minY = kity.Utils.queryPath('yAxis.min', data);
        if( kity.Utils.isNumber( minY ) ){
            pass['minY'] = minY;
        }

        if( data ){
            data.rangeX && (pass.rangeX = data.rangeX);
            data.rangeY && (pass.rangeY = data.rangeY);
        }
            

        oxy.update( pass );

        return oxy;
    },


    addLegend : function( data, oxy ){
        if( data.series && data.series.length > 0 ){
            var i,
                ele,
                param = oxy.param,
                container = this.paper.container,
                entry,
                top = 0,
                left = 0,
                tmpL, tmpT,
                line;

            if(this.legend){
                this.legend.html('');
            }else{
                this.legend = $('<div></div>').css({
                    position: 'absolute',
                    bottom: '-20px',
                    left : oxy.param.x + 'px',
                    height : '20px',
                    width : 'auto',     
                }).appendTo(container);
            }

            for (var i = 0; i < data.series.length; i++) {
                entry = data.series[i];

                top = oxy.param.height + (i*20) + 50;
                left = oxy.param.x + 10;

                ele = $('<div>' + entry.name + '</div>').css({
                    marginRight : '5px',
                    fontSize : '12px',
                    float : 'left'
                }).appendTo(this.legend);

                tmpL = left + $(ele).width() + 10;
                tmpT = top + 6;

                line = $('<div></div>').css({
                    marginRight : '20px',
                    marginTop : '5px',
                    height : '2px',
                    width : '40px',
                    float : 'left',
                    backgroundColor : (entry.color || entry.segments[0].color || config.color[i])
                }).appendTo(this.legend);
            }

        }
    }

} );