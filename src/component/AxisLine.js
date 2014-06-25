var AxisLine = kc.AxisLine = kity.createClass( "AxisLine", {
    base: kc.AnimatedChartElement,
    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            x1: 0,
            y1: 0,
            x2: 100,
            y2: 0,
            bound: null,
            width: 1,
            color: 'black',
            dash: null
        }, param ) );
        this.line = new kity.Path();
        this.canvas.addShape( this.line );
    },

    getAnimatedParam: function () {
        return [ 'x1', 'y1', 'x2', 'y2', 'width' ];
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            draw: [ 'x1', 'y1', 'x2', 'y2', 'bound', 'max', 'divide' ],
            stroke: [ 'color', 'width', 'dash' ]
        } );
    },

    draw: function ( x1, y1, x2, y2, bound, max, divide ) {
        var drawer = this.line.getDrawer(),
            s = kc.sharpen;

        if ( bound ) {
            bound = this.boundTo( x1, y1, x2, y2, bound );
        }
        bound = bound || [
            [ x1, y1 ],
            [ x2, y2 ]
        ];
        drawer.clear();
        drawer.moveTo( s( bound[ 0 ][ 0 ] ), s( bound[ 0 ][ 1 ] ) );
        drawer.lineTo( s( bound[ 1 ][ 0 ] ), s( bound[ 1 ][ 1 ] ) );
        if ( max ) {
            //计算最大值的数量级
            var oom = Math.log( max ) / Math.log( 10 );
            var oomV = Math.floor( oom );
            //根据数量级和max的值决定分隔情况
            var base = Math.pow( 10, oomV );
            var n = max / base;
            //var part = n / 5;
            // console.log( part );
            if ( ( n < 5 || n > 6 ) && base > 1 ) {
                base = base / 10;
                n = n * 10;
                while ( n > 6 ) {
                    n = n / 2;
                    base = base * 2;
                }
            }
            console.log( base );
            //绘制顶端的线段
            var bd = [
                [ x1 - 5, y1 ],
                [ x1, y1 ]
            ];
            drawer.moveTo( s( bd[ 0 ][ 0 ] ), s( bd[ 0 ][ 1 ] ) );
            drawer.lineTo( s( bd[ 1 ][ 0 ] ), s( bd[ 1 ][ 1 ] ) );
            for ( var i = 0; i < n; i++ ) {
                var y2i = y2 - base * i / max * ( y2 - y1 );
                var bd = [
                    [ x1 - 5, y2i ],
                    [ x1, y2i ]
                ];
                drawer.moveTo( s( bd[ 0 ][ 0 ] ), s( bd[ 0 ][ 1 ] ) );
                drawer.lineTo( s( bd[ 1 ][ 0 ] ), s( bd[ 1 ][ 1 ] ) );
                this.canvas.addShape( new kity.Text( base * i ).setX( x1 - 10 ).setY( y2i + 6 ).setTextAnchor( 'end' ) );
            }
        } else {
            var length = y2 - y1;
            var space = length / ( divide - 1 );
            for ( var i = 0; i < divide; i++ ) {
                var bd = [
                    [ x1 - 5, y1 + space * i ],
                    [ x1, y1 + space * i ]
                ];
                drawer.moveTo( s( bd[ 0 ][ 0 ] ), s( bd[ 0 ][ 1 ] ) );
                drawer.lineTo( s( bd[ 1 ][ 0 ] ), s( bd[ 1 ][ 1 ] ) );
            }
        }
    },

    stroke: function ( color, width, dash ) {
        var pen = new kity.Pen();
        pen.setWidth( width );
        pen.setColor( color );
        if ( dash ) {
            pen.setDashArray( dash );
        }
        this.line.stroke( pen );
    },

    boundTo: function ( x1, y1, x2, y2, bound ) {
        var b = bound,
            bx1 = b.x1,
            by1 = b.y1,
            bx2 = b.x2,
            by2 = b.y2,
            k, kk, bx1y, bx2y, by1x, by2x;

        function inRange( x, a, b ) {
            return ( a <= x && x <= b ) || ( a >= x && x >= b );
        }

        if ( x1 == x2 ) {
            return [
                [ x1, b.y1 ],
                [ x2, b.y2 ]
            ];
        }
        if ( y1 == y2 ) {
            return [
                [ b.x1, y1 ],
                [ b.x2, y2 ]
            ];
        }

        k = ( x1 - x2 ) / ( y1 - y2 );
        kk = 1 / k;
        bx1y = kk * ( bx1 - x1 ) + y1;
        bx2y = kk * ( bx2 - x1 ) + y1;
        by1x = k * ( by1 - y1 ) + x1;
        by2x = k * ( by2 - y1 ) + x1;

        var inc = [];
        if ( inRange( bx1y, by1, by2 ) ) {
            inc.push( [ bx1, bx1y ] );
        }
        if ( inRange( bx2y, by1, by2 ) ) {
            inc.push( [ bx2, bx2y ] );
        }
        if ( inRange( by1x, bx1, bx2 ) ) {
            inc.push( [ by1x, by1 ] );
        }
        if ( inRange( by2x, bx1, bx2 ) ) {
            inc.push( [ by2x, by2 ] );
        }
        if ( inc.length > 1 ) {
            return inc;
        }
    }
} );