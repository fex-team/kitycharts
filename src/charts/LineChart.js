var LineData = kc.LineData = kity.createClass( 'LineData', {
    base: kc.Data,
    format: function () {
        var origin = this.origin;
        
        var tmp, series = [], xAxis = [], min = 0, max = 100;

        var count =  '1' in this.origin? 2 : '0' in this.origin ? 1 : 0;
        var pvReal, adPvReal, pvPred, adPvPred;

        if( count > 0 ){
            for(var i = 0; i < count; i++){
                tmp = origin[ i + '' ];

                pvReal = tmp['pv']['real'];
                adPvReal = tmp['adPv']['real'];
                pvPred = JSON.parse( JSON.stringify( tmp['pv']['pred'] ));
                adPvPred = JSON.parse( JSON.stringify( tmp['adPv']['pred'] ));

                pvPred.unshift( pvReal[ pvReal.length - 1 ] );
                adPvPred.unshift( adPvReal[ adPvReal.length - 1 ] );

                series = series.concat([
                    {
                        "name": tmp["label"] + "-pv",
                        "segments" : [
                            {
                                "dash" : null,
                                "data" : pvReal
                            },
                            {
                                "dash" : [2],
                                "data" : pvPred
                            }
                        ]
                    },
                    {
                        "name": tmp["label"] + "-adPv",
                        "segments" : [
                            {
                                "dash" : null,
                                "data" : adPvReal
                            },
                            {
                                "dash" : [2],
                                "data" : adPvPred
                            }
                        ]
                    }
                ]);
            }

            var length = origin[0]['pv']['real'].length + origin[0]['pv']['pred'].length;

            for(var i = 0; i < length; i++){
                xAxis.push('第'+(i+1)+'天');
            }

            var all = [], tmp;
            for(var i in series){
                tmp = series[ i ]
                if( tmp.segments && tmp.segments.length > 0 ){
                    for (var j = 0; j < tmp.segments.length; j++) {
                        all = all.concat( tmp.segments[j].data );
                    }
                }else{
                    all = all.concat( origin.series[ i ].data );
                }
            }

            var min = Math.min.apply([], all) || 0;
            var max = Math.max.apply([], all) || 100;
        }

        return {
            xAxis :  {
                categories : xAxis || [],
                step : 1
            },
            // yAxis :  {
            //     categories : yAxis || [],
            //     step : 10
            // },
            series : series || [],
            rangeY : [min, max]
        };
    }
} );


var defaultStyle = {
    color : [
        '#60afe4', '#f39b7d', '#9dd3f7', '#f7c2b0'
    ],
    line : {
        width : 2,
        dash : [ 2 ]
    },
    indicatrix : {
        color : '#BBB',
        width : 1,
        dash : [ 4, 2 ],
    },
    avgLine : {
        color : '#DDD',
        width : 1
    },
    coordinate : {
        components : [ 'xAxis', 'yAxis', 'xCat', 'yCat'],
        heading : 50,
        x : 60,
        y : 20
    },
    circle : {
        radius : 4,
        stroke : {
            width : 2,
            color : '#FFF'
        }
    },
    enableAnimation : true
};

var LineChart = kc.LineChart = kity.createClass( 'LineChart', {
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

        this.addElement( 'multilines', new kc.ElementList() );

        this.setData( new kc.LineData() );

        this.bindAction();
    },

    update: function () {
        var param = this.param;
        var data = this.data.format();

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

        this.formattedData = this.drawLines( param, data, oxy );
        this.updateCircle( data );
        this.updateIndicatrix(-100, 0);

        this.addLegend( data, oxy );

    },

    updateCircle : function( data ){
        var l = this.circleArr && this.circleArr.length;
        if( l && l > 0 ){
            for (var i = 0; i < l; i++) {
                this.circleArr.pop().remove();
            }
        }

        this.circleArr = [];
        var i, circle, style = defaultStyle.circle;
        for (var i = 0; i < data.series.length; i++) {
            circle = new kity.Circle(style.radius, -20, -20);
            circle.lineData = data.series[i];
            
            var pen = new kity.Pen();
            pen.setWidth( style.stroke.width );
            pen.setColor( style.stroke.color );

            circle.fill( data.series[i].color || defaultStyle.color[i] );
            circle.stroke( pen );

            this.circleArr.push( circle );
        }
        this.canvas.addShapes( this.circleArr );
    },

    hideCircle : function(circle){
        circle.setCenter(-100, -100);
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

        if( data )
            pass.rangeY = data.rangeY;

        oxy.update( pass );

        return oxy;
    },

    bindAction : function(){
        var self = this;
        this.currentIndex = 0;

        this.paper.on( 'mousemove', function (ev) {
            var oxy = self.coordinate;
                param = oxy.param
                data = self.formattedData;;
            var oev = ev.originEvent;
            var x = oev.offsetX;
            var y = oev.offsetY;
            var i, l = self.circleArr.lenth;
            
            var reuslt = oxy.xRuler.leanTo( x - oxy.param.x, 'map' );
            if( !reuslt || reuslt.index > data.series[0].positions.length - 1 ) return;

            var pX = reuslt.value + oxy.param.x;

            var pY = 0;
            var index = reuslt.index;

            for (i = 0; i < self.circleArr.length; i++) {
                pY = data.series[i].positions[index][1];
                self.circleArr[i].setCenter(pX, pY);
            }

            self.updateIndicatrix(pX, oxy.param.height + oxy.param.y);

            self.currentIndex = index;
        } );

        this.paper.on('click', function(ev){
            var oxy = self.coordinate;
            if( self.param.onCircleClick && ev.targetShape.lineData){
                var target = ev.targetShape,
                    index = self.currentIndex;
                var info = {
                    circle : target,
                    lineData : target.lineData,
                    position : target.getCenter(),
                    value : target.lineData.values[ index ],
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.x,
                    marginTop : oxy.param.y,
                    data : data
                };
                self.param.onCircleClick( info );
            }
        });
    },

    drawLines: function ( param, data, oxy ) {

        var xRuler = oxy.xRuler,
            yRuler = oxy.yRuler;

        var series = data.series,
            i, j, k, yPos, point, pointsArr = [], linesArr = [],
            lineData,
            xFrom = xRuler.map().from,
            segments, line;

        for (i = 0; i < series.length; i++) {

            line = series[i];
            line.positions = [];
            line.values = [];

            segments = series[i].segments;

            if( segments.length ){
                for (var k = 0; k < segments.length; k++) {
                    var offset = 0;
                    if(k > 0){
                        var index = k, anchor = 0;
                        while(--index >= 0){
                            anchor += segments[ index ].data.length;
                        }
                        offset = oxy.xRuler.map_grid[ anchor - k ];
                    }else{
                        offset = 0;
                    }
                    var segment = segments[k];

                    pointsArr = array2points( segment.data, offset );
                    linesArr.push({
                            points : pointsArr,
                            color : segment.color || series[i].color || defaultStyle.color[i],
                            dash : segment.dash || null,
                            width: defaultStyle.line.width,
                            defaultPos : oxy.param.height,
                            factor : +new Date
                        });

                    // 将位置合成一条线并记录在serie的positions
                    var l = segment.data.length-1;
                    if( k == segments.length-1 ){
                        line.values = line.values.concat( segment.data );
                        line.positions = line.positions.concat( pointsArr );
                    }else{
                        line.values = line.values.concat( segment.data.slice(0, l) );
                        line.positions = line.positions.concat( pointsArr.slice(0, l) );
                    }

                }
            }
        }

        function array2points(lineData, offset){
            var offset = offset || 0;
            var pointsArr = [];
            for (j = 0; j < lineData.length; j++) {
                point = oxy.measurePoint( [j, lineData[j]] );
                point[0] += offset;
                                
                pointsArr.push( point );
            }
            return pointsArr;
        }

        var multilines = this.getElement( 'multilines');
        multilines.update({
            elementClass: kc.Polyline,
            list: linesArr,
            fx: defaultStyle.enableAnimation
        });

        return data;
    },

    addLegend : function( data, oxy ){
        if( data.series && data.series.length > 0 ){
            var i,
            name,
            ele,
            param = oxy.param,
            container = this.paper.container,
            legendLines,
            entry,
            list = [],
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