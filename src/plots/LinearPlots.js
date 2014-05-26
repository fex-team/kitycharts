(function(){

var LinearPlots = kc.LinearPlots = kity.createClass( 'LinearPlots', {
    base: kc.ChartElement,

    constructor: function ( coordinate, config ) {
        this.callBase();
        this.param.coordinate = this.coordinate = coordinate;
        this.param.config = this.config = config;
    },

    // update: function ( config ) {
    //     var config = config || this.config;
    //     return this.drawPlots( config );
    // },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            drawPlots: [ 'coordinate', 'config' ]
        } );
    },

    drawPlots: function ( coordinate, config ) {
        var oxy = this.coordinate;
        var xRuler = oxy.xRuler,
            yRuler = oxy.yRuler;

        var config = this.config,
            series = config.series[ this.chartType ],
            opt = this.config.plotOptions,
            i, j, k, m, yPos, point, pointsArr = [], linesArr = [], dotArr = [],
            lineData,
            line;

        var queryPath = kity.Utils.queryPath;
        for (i = 0; i < series.length; i++) {

            line = series[i];
            line.values = [];
            line.positions = [];


            var offset = 0;
            var lineColor = this._getEntryColor( line, i );

            if( this.chartType == 'area' ){
                
                if( config.yAxis.stacked ){
                    var p = config.yAxis.percentage;
                    var offsetType = p ? 'percentageOffset' : 'offset';
                    var allOffsetType = p ? 'allPercentageOffset' : 'allOffset';

                    var arr1 = this._array2points( line[ offsetType ], offset );
                    var arr2 = this._array2points( kity.Utils.copy( line[ allOffsetType ][ line.indexInGroup + 1 ] ), offset ).reverse();

                    pointsArr = arr1.concat( arr2 );

                }else{
                    pointsArr = this._array2points( line.data, offset );
                    var areaPointArr = kity.Utils.copy( pointsArr );
                    var x0 = oxy.measurePointX( 0 ),
                        y0 = oxy.measurePointY( oxy.yRuler._ref.from );

                    areaPointArr = areaPointArr.concat([
                        [ pointsArr[ pointsArr.length-1 ][ 0 ], y0],
                        [ x0, y0 ],
                    ]);
                    pointsArr = areaPointArr;
                }   

                this._drawPolygon.bind(this)( pointsArr, line, i );
                
            }
            
            pointsArr = this._array2points( line.data, offset );
            
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

        this.getElement( 'multilines' ).update({
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

        return config;
    },

    _array2points : function( lineData, offset ){
        var offset = offset || 0;
        var pointsArr = [];
        for (j = 0; j < lineData.length; j++) {
            point = this.coordinate.measurePoint( [j, lineData[j]] );
            point[0] += offset;
                            
            pointsArr.push( point );
        }
        return pointsArr;
    },

    _getEntryColor : function( entry, i ){
         return entry.color || this.config.color[ i ] || this.config.finalColor;
    }

} );


})();