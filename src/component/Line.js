var Line = kc.Line = kity.createClass( "Line", {
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
            draw: [ 'x1', 'y1', 'x2', 'y2', 'bound' ],
            stroke: [ 'color', 'width', 'dash' ]
        } );
    },

    draw: function ( x1, y1, x2, y2, bound ) {
        var drawer = this.line.getDrawer(),
            s = kc.sugar.sharpen;

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
            return [ [ x1, b.y1 ], [ x2, b.y2 ] ];
        }
        if ( y1 == y2 ) {
            return [ [ b.x1, y1 ], [ b.x2, y2 ] ];
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