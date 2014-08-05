/**
 * @build
 */

var RegularPolygon = kity.RegularPolygon = kity.createClass( 'RegularPolygon', ( function () {
    function p2o( length, angle ) {
        return [ length * Math.cos( angle ), -length * Math.sin( angle ) ];
    }
    return {
        base: kity.Path,
        constructor: function ( side, radius ) {
            this.callBase();
            this.radius = radius || 100;
            this.side = Math.max( side || 3, 3 );
            this.draw();
        },
        draw: function () {
            var r = this.radius,
                n = this.side,
                s = Math.PI * 2 / n;
            var path = [];
            path.push( [ 'M', p2o( r,  Math.PI / 2 ) ] );
            for ( var i = 1; i <= n; i++ ) {
                path.push( [ 'L', p2o( r, s * i + Math.PI / 2 ) ] );
            }
            path.push( 'z' );
            this.setPathData( path );
        }
    };
} )() );