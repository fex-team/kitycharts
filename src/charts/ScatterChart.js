var ScatterData = kc.ScatterData = kity.createClass( 'ScatterData', {
    base: kc.Data,
    format: function () {
        var origin = this.origin;
        var isEmpty = !( 'data_record' in origin );
        var data_record = origin.data_record && origin.data_record.map( function ( r ) {
            return {
                x: +r.x * 100,
                y: +r.y * 100,
                label: r.label,
                value: r.value,
                percent: +r.percent * 100
            };
        } ) || [];

        var query = new kc.Query( data_record );

        var xMin, xMax, xDur;
        xMin = query.count() && query.min( 'x' ).x || 0;
        xMax = query.count() && query.max( 'x' ).x || 0;
        xDur = xMax - xMin;
        xDur = xDur || 40;
        xMin -= xDur / 4;
        xMax += xDur / 4;

        var yMin, yMax, yDur;
        yMin = query.count() && query.min( 'y' ).y || 0;
        yMax = query.count() && query.max( 'y' ).y || 0;
        yDur = yMax - yMin;
        yDur = yDur || 40;
        yMin -= yDur / 4;
        yMax += yDur / 4;

        return {
            data_dim: +origin.data_dim,
            data_average_x: isEmpty ? 0 : +origin.data_average_x * 100,
            data_average_y: isEmpty ? 0 : +origin.data_average_y * 100,
            unit_x: origin.unit_x,
            unit_y: origin.unit_y,
            data_record: data_record,
            rangeX: [ xMin, xMax ],
            rangeY: [ yMin, yMax ]
        };
    }
} );

function appendUnit( unit ) {
    return function ( num ) {
        return ( ( num * 10 ) | 0 ) / 10 + ( unit || '' );
    };
}

var ScatterChart = kc.ScatterChart = kity.createClass( 'ScatterChart', {
    base: kc.Chart,

    constructor: function ( target, param ) {
        this.callBase( target, param );

        this.addElement( 'oxy', new kc.CategoryCoordinate() );
        this.addElement( "scatter", new kc.ElementList() );
        this.addElement( 'avg-x-line', new kc.Line( {
            color: '#f39488',
            dash: [ 2 ]
        } ) );
        this.addElement( 'avg-line', new kc.Line( {
            color: '#62a9dd',
            dash: [ 4 ]
        } ) );
        this.addElement( 'avg-y-line', new kc.Line( {
            color: '#f39488',
            dash: [ 2 ]
        } ) );
        this.addElement( 'avg-x-tip', new kc.Tooltip( {
            background: '#f39488',
            color: 'white',
            at: 'up',
            content: '',
            padding: [ 2, 10, 2, 10 ],
            anchorSize: 4
        } ) );
        this.addElement( 'avg-y-tip', new kc.Tooltip( {
            background: '#f39488',
            color: 'white',
            at: 'right',
            content: '',
            padding: [ 2, 10, 2, 10 ],
            anchorSize: 4
        } ) );

        this.marquee = new kc.Marquee( this );
        this.setData( new kc.ScatterData() );

        this.initMarqueeZoom();
    },

    initMarqueeZoom: function () {
        var me = this;
        var zoomStack = [ {
            rangeX: null,
            rangeY: null
        } ];

        function inRange( x, a, b ) {
            return ( a <= x && x <= b ) || ( a >= x && x >= b );
        }

        function getPointInRange( data, rulerX, rulerY, left, right, top, bottom ) {
            var count = 0;
            data = data.data_record;

            left = rulerX.measure( left );
            right = rulerX.measure( right );
            top = rulerY.measure( top );
            bottom = rulerY.measure( bottom );

            for ( var i = 0; i < data.length; i++ ) {
                if ( inRange( data[ i ].x, left, right ) && inRange( data[ i ].y, bottom, top ) ) {
                    count++;
                }
            }
            return count;
        }

        function updateRange( oxy, range, param, data ) {
            oxy.update( range );
            me.drawAverage( param, data, oxy );
            me.drawScatter( param, data, oxy );
        }

        this.marquee.on( 'marquee', function ( e ) {
            var ed = e.data,
                start = ed.start,
                end = ed.end,
                param = me.param,
                data = me.data.format(),
                oxy = me.getElement( 'oxy' ),
                rulerX = oxy.getXRuler().reverse(),
                rulerY = oxy.getYRuler().reverse(),
                left = Math.min( start.x, end.x ) - oxy.x,
                right = Math.max( start.x, end.x ) - oxy.x,
                top = Math.min( start.y, end.y ) - oxy.y,
                bottom = Math.max( start.y, end.y ) - oxy.y;

            if ( getPointInRange( data, rulerX, rulerY, left, right, top, bottom ) < 2 ) return;

            var range = {
                rangeX: [ rulerX.measure( left ), rulerX.measure( right ) ],
                rangeY: [ rulerY.measure( bottom ), rulerY.measure( top ) ]
            };

            zoomStack.push( range );

            updateRange( oxy, range, param, data );
        } );

        this.paper.on( 'dblclick', function () {
            var oxy = me.getElement( 'oxy' ),
                param = me.param,
                data = me.data.format(),
                range = zoomStack[ zoomStack.length - 2 ];
            if ( range ) {
                updateRange( oxy, range, param, data );
            }
            if ( zoomStack.length > 1 ) zoomStack.pop();
        } );
    },

    update: function () {
        var param = this.param,
            data = this.data.format(),
            oxy = this.drawOxy( param, data );

        this.drawAverage( param, data, oxy );
        this.drawScatter( param, data, oxy );
    },

    enableCollapse: function ( value ) {
        this.param.enableCollapse = value;
        this.update();
    },

    drawOxy: function ( param, data ) {
        var oxy = this.getElement( 'oxy' );

        oxy.update( {
            dataSet: data.data_record,
            width: this.getWidth() - 100,
            height: this.getHeight() - 50,
            x: 60,
            y: 20,
            formatX: appendUnit( data.unit_x ),
            formatY: appendUnit( data.unit_y ),
            rangeX: data.rangeX,
            rangeY: data.rangeY
        } );

        return oxy;
    },

    drawAverage: function ( param, data, oxy ) {

        var xRuler = oxy.getXRuler(),
            yRuler = oxy.getYRuler();

        var ax = oxy.param.x + xRuler.measure( data.data_average_x ),
            ay = oxy.param.y + yRuler.measure( data.data_average_y ),
            xLine = this.getElement( 'avg-x-line' ),
            yLine = this.getElement( 'avg-y-line' ),
            xTip = this.getElement( 'avg-x-tip' ),
            yTip = this.getElement( 'avg-y-tip' ),
            aLine = this.getElement( 'avg-line' );

        if ( 'data_average_x' in data ) {

            xLine.setVisible( true )
                .animate( {
                    x1: ax,
                    x2: ax,
                    y1: oxy.param.y + oxy.param.heading,
                    y2: oxy.param.y + oxy.param.height
                } );

            xTip.setVisible( true )
                .update( {
                    content: {
                        text: appendUnit( data.unit_x )( data.data_average_x ),
                        color: 'white'
                    }
                } )
                .animate( {
                    x: ax,
                    y: oxy.param.y + oxy.param.heading
                } );

        } else {

            xLine.setVisible( false );
            xTip.setVisible( false );

        }

        if ( 'data_average_y' in data ) {

            yLine.setVisible( true )
                .animate( {
                    x1: oxy.param.x,
                    x2: oxy.param.x + oxy.param.width - oxy.param.heading,
                    y1: ay,
                    y2: ay
                } );

            yTip.setVisible( true )
                .update( {
                    content: {
                        text: appendUnit( data.unit_y )( data.data_average_y ),
                        color: 'white',
                        at: 'right',
                        margin: 10
                    }
                } )
                .animate( {
                    x: oxy.param.x + oxy.param.width - oxy.param.heading,
                    y: ay
                } );

        } else {

            yLine.setVisible( false );
            yTip.setVisible( false );

        }

        if ( 'data_average_x' in data && 'data_average_y' in data ) {

            aLine.setVisible( true ).animate( {
                x1: oxy.param.x + xRuler.measure( 0 ),
                y1: oxy.param.y + yRuler.measure( 0 ),
                x2: ax,
                y2: ay,
                bound: {
                    x1: oxy.param.x,
                    y1: oxy.param.y,
                    x2: oxy.param.x + oxy.param.width,
                    y2: oxy.param.y + oxy.param.height
                }
            } );

        } else {

            aLine.setVisible( false );

        }
    },

    drawScatter: function ( param, data, oxy ) {
        var dim = +data.data_dim,
            query = new kc.Query( data.data_record ),
            scatter = this.getElement( 'scatter' ),
            xRuler = oxy.getXRuler(),
            yRuler = oxy.getYRuler(),
            minRadius, maxRadius, radiusRuler,
            minValue, maxValue,
            rooted;

        function sqrt( data ) {
            return Math.sqrt( data.value );
        }

        if ( dim > 2 ) {

            rooted = query.map( sqrt );

            minValue = rooted.min();
            maxValue = rooted.max();

            minRadius = 5;
            maxRadius = 40;

            radiusRuler = new kc.Ruler( minValue, maxValue )
                .map( minRadius, maxRadius );
        }

        var list = query.map( function ( data ) {
            var radius = dim > 2 ? radiusRuler.measure( sqrt( data ) ) : 5;
            return {
                // common params
                x: oxy.x + xRuler.measure( data.x ),
                y: oxy.y + yRuler.measure( data.y ),

                labelText: data.label,

                // param for CircleDot
                radius: radius,
                labelPosition: 'auto',

                // param for PieDot
                angel: -90,
                innerRadius: radius,
                outerRadius: radius + 6,
                percent: data.percent,
                showPercent: true,

                collapsed: 0
            };
        } ).list();

        function isOverlap( c1, c2, tolerance ) {
            var r1 = c1.outerRadius || c1.radius,
                r2 = c2.outerRadius || c2.radius,
                dd = r1 + r2 + tolerance,
                dx = c1.x - c2.x,
                dy = c1.y - c2.y;
            return dx * dx + dy * dy < dd * dd;
        }

        list.sort( function ( y, x ) {
            return ( x.outerRadius || x.radius ) - ( y.outerRadius || y.radius );
        } );

        if ( dim > 2 && param.enableCollapse ) {
            var i, j;
            for ( i = 0; i < list.length; i++ ) {
                if ( list[ i ].collapsed ) continue;
                for ( j = i + 1; j < list.length; j++ ) {
                    if ( list[ j ].collapsed ) continue;
                    if ( isOverlap( list[ i ], list[ j ], 30 ) ) {
                        list[ j ].collapsed = 1;
                    }
                }
            }
        }

        scatter.update( {

            elementClass: {
                '2': kc.CircleDot,
                '3': kc.CircleDot,
                '4': kc.PieDot
            }[ dim ],

            list: list
        } );
    }
} );