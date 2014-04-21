var LineData = kc.LineData = kity.createClass( 'LineData', {
    base: kc.Data,
    format: function () {
        var origin = this.origin;
        
        var tmp, series = [], xAxis = [], min = 0, max = 100;

        var count =  '1' in this.origin? 2 : '0' in this.origin ? 1 : 0;

        if( count > 0 ){
            for(var i = 0; i < count; i++){
                tmp = origin[ i + '' ];
                series = series.concat([
                    {
                        "name": "pv",
                        "segments" : [
                            {
                                "dash" : null,
                                "data" : tmp['pv']['real']
                            },
                            {
                                "dash" : [2],
                                "data" : tmp['pv']['pred']
                            }
                        ]
                    },
                    {
                        "name": "adPv",
                        "segments" : [
                            {
                                "dash" : null,
                                "data" : tmp['adPv']['real']
                            },
                            {
                                "dash" : [2],
                                "data" : tmp['adPv']['pred']
                            }
                        ]
                    }
                ]);
            }

            var length = origin[0]['pv']['real'].length;

            for(var i = 0; i < length; i++){
                xAxis.push(i+1+'');
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
            xAxisCategories :  xAxis || [],
            series : series || [],
            rangeY : [min, max]
        };
    }
} );


var defaultColors = [
    '#60afe4', '#f39b7d', '#9dd3f7', '#f7c2b0'
];

var LineChart = kc.LineChart = kity.createClass( 'LineChart', {
    base: kc.Chart,

    constructor: function ( target, param ) {
        this.callBase( target, param );

        var oxy = this.addElement( 'oxy', new kc.CategoryCoordinate({
            components : [ 'xAxis', 'yAxis', 'yCat']
        }) );

        this.yLine = this.addElement( 'avg-y-line', new kc.Line( {
            color : '#DDD',
            width : 1
        } ) );

        this.indicatrix =  this.addElement( 'indicatrix', new kc.Line({
            color : '#BBB',
            width : 1,
            dash : [ 4, 2 ],
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
            var y1 = oxy.yRuler.measure(oxy.param.rangeY[0]);
            var y2 = oxy.yRuler.measure(oxy.param.rangeY[1]);
            var averageY = (y1 + y2)/2;

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

    },

    updateCircle : function( data ){
        var l = this.circleArr && this.circleArr.length;
        if( l && l > 0 ){
            for (var i = 0; i < l; i++) {
                this.circleArr.pop().remove();
            }
        }

        this.circleArr = [];
        var i, circle;
        for (var i = 0; i < data.series.length; i++) {
            circle = new kity.Circle(4, -20, -20);
            circle.lineData = data.series[i];
            
            var pen = new kity.Pen();
            pen.setWidth( 2 );
            pen.setColor( '#FFF' );

            circle.fill( data.series[i].color || defaultColors[i] );
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
            x: 60,
            y: 20,
            components: []
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
            if( !reuslt ) return;

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

            if( segments ){
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
                            color : segment.color || series[i].color || defaultColors[i],
                            dash : segment.dash || null,
                            width: 2
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
            }else{
                pointsArr = array2points( series[i].data );
                linesArr.push({
                        points : pointsArr,
                        color : line.color || defaultColors[i],
                        dash : null,
                        width: 2
                    });

                line.values = line.data;
            }
        }

        function array2points(lineData, offset){
            var offset = offset || 0;
            var pointsArr = [];
            for (j = 0; j < lineData.length; j++) {
                yPos = oxy.yRuler.measure( lineData[j] );
                point = [ xRuler.map_grid[j] + oxy.param.x + offset, yPos];
                pointsArr.push( point );
            }
            return pointsArr;
        }

        var multilines = this.getElement( 'multilines');
        multilines.update({
            elementClass: kc.Polyline,
            list: linesArr
        });

        return data;
    }

} );