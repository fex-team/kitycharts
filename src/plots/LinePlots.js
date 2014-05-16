(function(){

var LinePlots = kc.LinePlots = kity.createClass( 'LinePlots', {
    base: kc.ChartElement,

    constructor: function ( coordinate, config, type ) {
        this.callBase();
        this.coordinate = coordinate;
        this.config = config;
        this.chartType = type || this.config.chart.type || 'line';
        
        this.addElement( 'multilines', new kc.ElementList() );
        this.addElement( 'lineDots', new kc.ElementList() );

    },

    update: function ( config ) {
        var config = config || this.config;
        this.formattedData = this.drawLines( config );
    },

    drawLines: function ( data ) {
        var oxy = this.coordinate;
        var xRuler = oxy.xRuler,
            yRuler = oxy.yRuler;

        var series = data.series[ this.chartType ],
            config = this.config,
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

            lineColor = line.color || config.color[i] || config.finalColor;

            if( this.chartType == 'area' ){
                
                if( config.yAxis.stacked ){
                    var p = config.yAxis.percentage;
                    var offsetType = p ? 'percentageOffset' : 'offset';
                    var allOffsetType = p ? 'allPercentageOffset' : 'allOffset';

                    var arr1 = array2points( line[ offsetType ], offset );
                    var arr2 = array2points( kity.Utils.copy( line[ allOffsetType ][ line.indexInGroup + 1 ] ), offset ).reverse();

                    pointsArr = arr1.concat( arr2 );

                }else{
                    pointsArr = array2points( line.data, offset );
                    var areaPointArr = kity.Utils.copy( pointsArr );
                    var x0 = oxy.measurePointX( 0 ),
                        y0 = oxy.measurePointY( oxy.yRuler._ref.from );

                    areaPointArr = areaPointArr.concat([
                        [ pointsArr[ pointsArr.length-1 ][ 0 ], y0],
                        [ x0, y0 ],
                    ]);
                    pointsArr = areaPointArr;
                }   

                drawPolygon.bind(this)( pointsArr );
                
            }
            
            pointsArr = array2points( line.data, offset );
            
            var lineWidth = this.chartType == 'area'? opt.area.stroke.width : opt.line.width;

            linesArr.push({
                    points : pointsArr,
                    color : lineColor,
                    dash : line.dash || null,
                    width: lineWidth,
                    defaultPos : oxy.param.height,
                    factor : +new Date
                });

            line.values = line.data;
            line.positions = pointsArr;

            
            if( opt.label.enabled || opt[ this.chartType ].dot.enabled ){

                var tmpPos, dotParam, radius = 0;

                for (m = 0; m < line.positions.length; m++) {
                    tmpPos = line.positions[ m ];

                    if( opt[ this.chartType ].dot.enabled ){
                        radius = opt[ this.chartType ].dot.radius;
                    }

                    dotParam = {
                        color: lineColor,
                        radius: radius,
                        x: tmpPos[0],
                        y: tmpPos[1]
                    };

                    if( opt.label.enabled ){

                        dotParam.label = {
                                margin: opt.label.text.margin,
                                color:  opt.label.text.color,
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

        function drawPolygon( pointArr ){
            var area = new kity.Polygon(pointArr),
                paper = this.container.paper,
                fill, opacity;

            if( kity.Utils.isNumber( opacity = config.plotOptions.area.fill.opacity ) ){
                fill = new kity.Color( lineColor ).set( 'a', opacity );
            }else{
                fill = new kity.LinearGradientBrush().pipe( function() {
                    this.addStop( 0, lineColor );
                    this.addStop( 1, lineColor, config.plotOptions.area.fill.grandientStopOpacity );
                    this.setStartPosition(0, 0);
                    this.setEndPosition(0, 1);
                    paper.addResource( this );
                })
            }

            area.fill( fill );

            this.canvas.addShape(area); 
        }


        var multilines = this.getElement( 'multilines' );

        multilines.update({
            elementClass: kc.Polyline,
            list: linesArr,
            fx: config.enableAnimation
        });
        
        if( opt.label.enabled || opt[ this.chartType ].dot.enabled ){
            var lineDots = this.getElement( 'lineDots' );
            lineDots.update({
                elementClass: kc.CircleDot,
                list: dotArr,
                fx: config.enableAnimation
            });
        }

        return data;
    }

} );


})();