(function(){

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
    enableAnimation : false
};

var LineChart = kc.LineChart = kity.createClass( 'LineChart', {
    base: kc.ChartFrame,

    constructor: function ( target, param ) {
        this.defaultStyle = defaultStyle;
        this.callBase( target, param );

        this.setData( new kc.LineData() );
        this.addElement( 'multilines', new kc.ElementList() );
        this.bindAction();
    },

    update: function () {
        this.callBase();
        var data = this.currentData;
        this.formattedData = this.drawLines( this.param, data, this.coordinate );
        this.updateCircle( data );
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

    bindAction : function(){
        var self = this;
        this.currentIndex = 0;

        this.paper.on( 'mousemove', function (ev) {
            var oxy = self.coordinate;
            if(!oxy) return;

            var param = oxy.param,
                data = self.formattedData;
            var oev = ev.originEvent;
            var x = oev.offsetX;
            var y = oev.offsetY;
            var i, l = self.circleArr.length;
            
            var reuslt = oxy.xRuler.leanTo( x - oxy.param.x, 'map' );

            var maxLength = 0;
            var lenArr = [], tmpL;
            for (i = 0; i < data.series.length; i++) {
                tmpL = data.series[i].positions.length;
                if( tmpL > maxLength ){
                    maxLength = tmpL;
                }
            }

            if( !reuslt || reuslt.index > maxLength ) return;

            var pX = reuslt.value + oxy.param.x;

            var pY = 0;
            var index = reuslt.index, tmpPos;

            for (i = 0; i < self.circleArr.length; i++) {
                tmpPos = data.series[i].positions[index];
                if(tmpPos){
                    pY = tmpPos[1];
                    self.circleArr[i].setCenter(pX, pY);
                }else{
                    self.circleArr[i].setCenter(-100, -100);
                }

            }

            self.updateIndicatrix(pX, oxy.param.height + oxy.param.y);

            self.currentIndex = index;

            if( self.param.onCircleHover){
                var info = {
                    posX : pX,
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.x,
                    marginTop : oxy.param.y,
                    data : data
                };
                self.param.onCircleHover( info );
            }
        } );

        this.paper.on('click', function(ev){
            var oxy = self.coordinate;
            if(!oxy) return;

            if( self.param.onCircleClick && (ev.targetShape.lineData || Math.abs(self.indicatrix.param.x1 - ev.originEvent.offsetX) < 10) ){
                var target = ev.targetShape,
                    index = self.currentIndex,
                    indicatrixParam = self.indicatrix.param;

                var info = {
                    circle : target,
                    lineData : target.lineData,
                    position : target.getCenter ? target.getCenter() : { x: indicatrixParam.x1, y: oxy.param.height/2 },
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.x,
                    marginTop : oxy.param.y,
                    data : self.formattedData
                };

                if( target.lineData ){
                    info.value = target.lineData.values[ index ];
                }

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
    }

} );


})();