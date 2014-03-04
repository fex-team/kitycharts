var Star = kity.Star = kity.createClass( 'Star', ( function () {
    function p2o( length, angle ) {
        return [ length * Math.cos( angle ), -length * Math.sin( angle ) ];
    }
    /**
     * @see http://www.jdawiseman.com/papers/easymath/surds_star_inner_radius.html
     */
    var defaultRatioForStar = {
        '3': 0.2, // yy
        '5': 0.38196601125,
        '6': 0.57735026919,
        '8': 0.541196100146,
        '10': 0.726542528005,
        '12': 0.707106781187
    };
    return {
        base: kity.Path,
        constructor: function ( vertex, outerRadius, innerRadius, innerOffset, angleOffset ) {
            this.callBase();
            this.vertex = vertex || 3;
            this.outerRadius = outerRadius || 100;
            this.innerRadius = innerRadius || this.outerRadius * (defaultRatioForStar[this.vertex] || 0.5);
            this.innerOffset = innerOffset || {
                x: 0,
                y: 0
            };
            this.angleOffset = angleOffset || 0;
            this.angleOffset = this.angleOffset;
            this.draw();
        },
        draw: function () {
            var innerRadius = this.innerRadius,
                outerRadius = this.outerRadius,
                vertex = this.vertex,
                innerOffset = this.innerOffset,
                angleStep = Math.PI / vertex,
                angleOffset = Math.PI * this.angleOffset / 180;
            var path = [],
                i, p, HPI = Math.PI / 2;
            path.push( [ 'M', p2o( outerRadius, HPI ) ] );
            for ( i = 1; i <= vertex * 2; i++ ) {
                if ( i % 2 ) {
                    p = p2o( innerRadius, angleStep * i + HPI + angleOffset );
                    p[0] += innerOffset.x;
                    p[1] += innerOffset.y;
                } else {
                    p = p2o( outerRadius, angleStep * i + HPI );
                }

                path.push( [ 'L', p ] );
            }
            path.push( 'z' );
            this.setPathData( path );
        }
    };
} )() );