var HorizonData = kc.HorizonData = kity.createClass( 'HorizonData', {
    base: kc.Data,
    format: function ( format ) {
        var origin = this.origin;
        if ( format === undefined ) {
            return origin;
        } else if ( format === 'col' ) {
            //返回每项属性的最大和最小值
            var series = data.series;
            var result = {};
            var dividecount = 0;
            var ranges = [];
            var labels = [];
            for ( var i = 0; i < origin.categories.length; i++ ) {
                ranges.push( {
                    max: 0,
                    min: 0
                } );
            }
            for ( var key in series ) {
                labels.push( key );
                dividecount++;
                var s = series[ key ];
                for ( var j = 0; j < s.length; j++ ) {
                    var sa = s[ j ].args;
                    for ( var k = 0; k < origin.categories.length; k++ ) {
                        if ( parseFloat( sa[ k ] ) > ranges[ k ].max ) {
                            ranges[ k ].max = sa[ k ];
                        } else if ( parseFloat( sa[ k ] ) < ranges[ k ].min ) {
                            ranges[ k ].min = sa[ k ];
                        }
                    }
                }
            }
            result.dividecount = dividecount;
            result.ranges = ranges;
            result.labels = labels;
            return result;
        }
    }
} );
var HorizonChart = kc.HorizonChart = kity.createClass( 'HorizonChart', {
    base: kc.Chart,
    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.setData( new kc.HorizonData() );
        this.addElement( "Lines", new kc.ElementList() );
        this.addElement( "Axis", new kc.ElementList() );
        this.addElement( "xCate", new kc.ElementList() );
    },
    renderChart: function () {
        var colors = this.param.colors;
        var data = this.getData().format();
        var datacol = this.getData().format( 'col' );
        var labels = datacol.labels;
        var lLength = labels.length - 1;
        var container = this.getPaper().container;
        var _width = container.offsetWidth;
        var _height = container.offsetHeight;
        var padding = this.param.padding;
        var _space = ( _width - padding[ 1 ] - padding[ 3 ] ) / data.categories.length;
        var _AxisHeight = _height - padding[ 0 ] - padding[ 2 ]; //y坐标轴的高度
        var axis = this.getElement( 'Axis' );
        var lines = this.getElement( 'Lines' );
        var xCate = this.getElement( 'xCate' );
        var AxisLines = [];
        var Polylines = [];
        var xCates = [];
        //生成连线和Categories数据
        var series = data.series;
        for ( var key in series ) {
            var s = series[ key ];
            console.log( labels.indexOf( key ) );
            xCates.push( {
                text: key,
                at: 'left',
                x: padding[ 3 ] - 20,
                y: padding[ 0 ] + labels.indexOf( key ) * _AxisHeight / lLength
            } );
            for ( var j = 0; j < s.length; j++ ) {
                var item = {
                    points: [
                        [ padding[ 3 ], padding[ 0 ] + labels.indexOf( key ) * _AxisHeight / lLength ]
                    ],
                    color: colors[ labels.indexOf( key ) ] || 'black',
                    width: 0.3
                };
                Polylines.push( item );
                var args = s[ j ].args;
                for ( var k = 0; k < args.length; k++ ) {
                    item.points.push(
                        [ padding[ 3 ] + _space * ( k + 1 ), padding[ 0 ] + ( 1 - args[ k ] / datacol.ranges[ k ].max ) * _AxisHeight ]
                    );
                }
            }
        };
        for ( var i = 0; i <= data.categories.length; i++ ) {
            var item = {
                x1: padding[ 3 ] + _space * i,
                y1: padding[ 0 ],
                x2: padding[ 3 ] + _space * i,
                y2: _height - padding[ 2 ]
            };
            if ( i !== 0 ) {
                item.max = datacol.ranges[ i - 1 ].max;
            } else {
                item.divide = datacol.dividecount;
            }
            AxisLines.push( item );
        }
        //绘制线
        axis.update( {
            elementClass: kc.AxisLine,
            list: AxisLines,
            fx: false
        } );
        lines.update( {
            elementClass: kc.Polyline,
            list: Polylines,
            fx: false
        } );
        xCate.update( {
            elementClass: kc.Label,
            list: xCates,
            fx: false
        } );
    },
    update: function () {
        this.renderChart();
    }
} );