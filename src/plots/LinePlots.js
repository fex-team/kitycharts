(function(){

var LinePlots = kc.LinePlots = kity.createClass( 'LinePlots', {
    base: kc.ChartElement,

    constructor: function ( coordinate, config ) {
        this.callBase();
        this.coordinate = coordinate;
        this.config = config;
        
        this.addElement( 'multilines', new kc.ElementList() );
        this.addElement( 'lineDots', new kc.ElementList() );

        // this.bindAction();
    },

    update: function ( config ) {
        var config = config || this.config;
        this.formattedData = this.drawLines( config );
        this.updateCircle( config );
    },

    updateCircle : function( data ){
        var l = this.circleArr && this.circleArr.length;
        if( l && l > 0 ){
            for (var i = 0; i < l; i++) {
                this.circleArr.pop().remove();
            }
        }

        this.circleArr = [];
        var i, circle, style = this.config.interaction.circle, series = data.series.line;
        for (var i = 0; i < series.length; i++) {
            circle = new kity.Circle(style.radius, -20, -20);
            circle.lineData = series[i];
            
            var pen = new kity.Pen();
            pen.setWidth( style.stroke.width );
            pen.setColor( style.stroke.color );

            circle.fill( series[i].color || this.config.color[i] || this.config.finalColor );
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
            
            var reuslt = oxy.xRuler.leanTo( x - oxy.param.margin.left, 'map' );

            var maxLength = 0;
            var lenArr = [], tmpL, series = data.series.line;
            for (i = 0; i < series.length; i++) {
                tmpL = series[i].positions.length;
                if( tmpL > maxLength ){
                    maxLength = tmpL;
                }
            }

            if( !reuslt || reuslt.index > maxLength ) return;

            var pX = reuslt.value + oxy.param.margin.left;

            var pY = 0;
            var index = reuslt.index, tmpPos;

            for (i = 0; i < self.circleArr.length; i++) {
                tmpPos = series[i].positions[index];
                if(tmpPos){
                    pY = tmpPos[1];
                    self.circleArr[i].setCenter(pX, pY);
                }else{
                    self.circleArr[i].setCenter(-100, -100);
                }

            }

            // self.updateIndicatrix(pX, oxy.param.height + oxy.param.margin.top);

            self.currentIndex = index;

            if( self.param.onCircleHover){
                var info = {
                    posX : pX,
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.margin.left,
                    marginTop : oxy.param.margin.top,
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
                    marginLeft : oxy.param.margin.left,
                    marginTop : oxy.param.margin.top,
                    data : self.formattedData
                };

                if( target.lineData ){
                    info.value = target.lineData.values[ index ];
                }

                self.param.onCircleClick( info );
            }
        });
    },
    drawLines: function ( data ) {
        var oxy = this.coordinate;
        var xRuler = oxy.xRuler,
            yRuler = oxy.yRuler;

        var series = data.series.line,
            opt = this.config.plotOptions,
            i, j, k, m, yPos, point, pointsArr = [], linesArr = [], dotArr = [],
            lineData, lineColor,
            line;

        var queryPath = kity.Utils.queryPath;
        for (i = 0; i < series.length; i++) {

            line = series[i];
            line.positions = [];
            line.values = [];


            var offset = 0;

            pointsArr = array2points( line.data, offset );
            lineColor = line.color || this.config.color[i] || this.config.finalColor;

            if( queryPath( 'chart.type', data ) == 'area' ){
                var areaPointArr = kity.Utils.copy( pointsArr );
                var x0 = oxy.measurePointX(0),
                    y0 = oxy.measurePointY( oxy.yRuler._ref.from );

                areaPointArr = areaPointArr.concat([
                    [ pointsArr[ pointsArr.length-1 ][ 0 ], y0],
                    [ x0, y0 ],
                ]);

                var area = new kity.Polygon(areaPointArr),
                    paper = this.paper;

                area.fill(new kity.LinearGradientBrush().pipe( function() {
                    this.addStop(0, lineColor);
                    this.addStop(1, lineColor, queryPath('plotOptions.style.stopOpacity', data));
                    this.setStartPosition(0, 0);
                    this.setEndPosition(0, 1);
                    paper.addResource(this);
                }));

                this.canvas.addShape(area);
            }
            
            linesArr.push({
                    points : pointsArr,
                    color : lineColor,
                    dash : line.dash || null,
                    width: opt.line.width,
                    defaultPos : oxy.param.height,
                    factor : +new Date
                });

            // 将位置合成一条线并记录在serie的positions
            var l = line.data.length-1,
                tmpSegmentData, tmpPointsArr
                ;

            line.values = line.data;
            line.positions = pointsArr;

            
            if( opt.label.enabled || opt.line.dot.enabled ){

                var tmpPos, dotParam, radius = 0;

                for (m = 0; m < line.positions.length; m++) {
                    tmpPos = line.positions[ m ];

                    if( opt.line.dot.enabled ){
                        radius = this.config.plotOptions.line.dot.radius;
                    }

                    dotParam = {
                        color: lineColor,
                        radius: radius,
                        x: tmpPos[0],
                        y: tmpPos[1]
                    };

                    if( opt.label.enabled ){

                        dotParam.label = {
                                margin: this.config.plotOptions.label.text.margin,
                                color:  this.config.plotOptions.label.text.color,
                                text: line.values[ m ],
                            };
                    }

                    dotArr.push(dotParam);
                }
                line.dots = dotArr;
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

        if( !kity.Utils.queryPath('plotOptions.style.stopOpacity', data) ){
            var multilines = this.getElement( 'multilines' );
            multilines.update({
                elementClass: kc.Polyline,
                list: linesArr,
                fx: this.config.enableAnimation
            });
        }


        if( opt.label.enabled || opt.line.dot.enabled ){
            var lineDots = this.getElement( 'lineDots' );
            lineDots.update({
                elementClass: kc.CircleDot,
                list: dotArr,
                fx: this.config.enableAnimation
            });
        }

        return data;
    }

} );


})();