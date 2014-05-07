var ChartFrame = kc.ChartFrame = kity.createClass( 'ChartFrame', {
    base: kc.Chart,

    constructor: function ( target, param ) {
        this.callBase( target, param );

        var oxy = this.addElement( 'oxy', new kc.CategoryCoordinate(defaultStyle.coordinate) );   

        this.yLine = this.addElement( 'avg-y-line', new kc.Line( defaultStyle.avgLine ) );

        this.indicatrix =  this.addElement( 'indicatrix', new kc.Line({
            color : defaultStyle.indicatrix.color,
            width : defaultStyle.indicatrix.width,
            dash : defaultStyle.indicatrix.dash,
            y1 : 0,
            y2 : oxy.param.height + oxy.param.y,
        }) );
    },

    update: function () {
        var param = this.param;
        var data = this.currentData = this.data.format();

        var oxy = this.coordinate = this.drawOxy( param, data );

        if( oxy.param.rangeY ){
            var grid = oxy.yRuler.map_grid;
            var y1 = grid[0];
            var y2 = grid[ grid.length-1 ];
            var averageY = (y1 + y2)/2 + oxy.param.y;

            this.yLine.update( {
                    x1: oxy.param.x,
                    x2: oxy.param.x + oxy.param.width,
                    y1: averageY,
                    y2: averageY
                } );
        }

        this.updateIndicatrix(-100, 0);

        // this.addLegend( data, oxy );

    },

    updateIndicatrix : function(pX, pY){
        this.indicatrix.update({
            x1 : pX,
            x2 : pX,
            y1 : 0,
            y2 : pY
        });        
    },

    drawOxy: function ( param, data ) {
        var oxy = this.getElement( 'oxy' );

        var pass = {
            dataSet: data,
            width: this.getWidth() - 100,
            height: this.getHeight() - 50,
            // formatX: appendUnit( data.unit_x ),
            // formatY: appendUnit( data.unit_y )
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
                    backgroundColor : (entry.color || entry.segments[0].color || defaultStyle.color[i])
                }).appendTo(this.legend);
            }

        }
    }

} );