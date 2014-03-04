Array.prototype.flatten = function () {
    var result = [],
        length = this.length;
    for ( var i = 0; i < length; i++ ) {
        if ( this[ i ] instanceof Array ) {
            result = result.concat( this[ i ].flatten() );
        } else {
            result.push( this[ i ] );
        }
    }
    return result;
};

var Arrow = kity.Arrow = kity.createShape( 'Arrow', {
    base: kity.Path,
    constructor: function ( opt ) {
        this.option = kity.Utils.extend( {
            w: 100,
            h: 12,
            a: 30,
            b: 20,
            c: 20,
            d: 5,
            t: 2
        }, opt );
    },
    draw: function ( opt ) {
        opt = this.option = kity.Utils.extend( this.option, opt );
        
        var w = opt.w,
            h = opt.h,
            hh = h / 2,
            a = opt.a,
            b = opt.b,
            c = opt.c,
            d = opt.d,
            t = opt.t;
        var p0 = [ 0, -hh ],
            p1 = [ w, -hh ],
            p2 = [ w - b, -hh - c ],
            p3,
            p4 = [ w + a, 0 ],
            p5 = [ d, 0 ];

        switch ( t ) {
        case 0:
            p3 = p2;
            break;
        case 1:
            p3 = [ w + a - b - b * hh / c, -hh - c ];
            break;
        case 2:
            var x = w - b - 0.5 * c * ( b * h + a * c ) / ( b * b + c * c );
            var y = c * ( x - w - a ) / b;
            p3 = [ x, y ];
            break;
        case 3:
            p3 = [ w - b, -c * ( a + b ) / b ];
            break;
        }

        function m( p ) {
            return [ p[ 0 ], -p[ 1 ] ];
        }
        var pp0 = m( p0 ),
            pp1 = m( p1 ),
            pp2 = m( p2 ),
            pp3 = m( p3 );
        var path = [];
        path.push( [ 'M', p0 ] );
        path.push( [ 'L', p1 ] );
        path.push( [ 'L', p2 ] );
        path.push( [ 'L', p3 ] );
        path.push( [ 'L', p4 ] );
        path.push( [ 'L', pp3 ] );
        path.push( [ 'L', pp2 ] );
        path.push( [ 'L', pp1 ] );
        path.push( [ 'L', pp0 ] );
        path.push( [ 'L', p5 ] );
        path.push( [ 'L', p0 ] );
        path.push( 'C' );
        this.setPathData( path.flatten().join( ' ' ) );
    }
} );