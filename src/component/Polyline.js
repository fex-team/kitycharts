// {
//     points: [
//         [0, 0],
//         [100, 100],
//         [100, 200]
//     ],
//     width: 1,
//     color: 'black',
//     dash: null
// }
var Polyline = kc.Polyline = kity.createClass( "Polyline", {
    base: kc.AnimatedChartElement,
    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            points: [
                [0, 0],
                [0, 0]
            ],
            width: 3,
            color: 'black',
            dash: null,
            animatedDir : 'y',
            factor: 0
        }, param ) );

        this.polyline = new kity.Path();
        this.canvas.addShape( this.polyline );
    },

    getAnimatedParam: function () {
        return [ 'factor' ];
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            draw: [ 'points', 'factor' ],
            stroke: [ 'color', 'width', 'dash' ]
        } );
    },

    parsePoint : function(index, pos, points){
        if(points && points[index]){
            return points[index][pos];
        }else{
            return 0;
        }
    },

    draw: function ( points, factor, animatedBeginValueCopy, progress ) {
        var drawer = this.polyline.getDrawer(),
            s = kc.sharpen;

        if( points.length > 0 ){
            drawer.clear();
            var dir = this.param.animatedDir,
                xDir = (dir == undefined || dir == 'x'),
                yDir = (dir == undefined || dir == 'y');


            if( animatedBeginValueCopy ){
                var prevPoints = animatedBeginValueCopy.points;
                var firstPointX = this.parsePoint(0, 0, prevPoints);
                var firstPointY = this.parsePoint(0, 1, prevPoints);
                var pointX, pointY;
                drawer.moveTo(
                    xDir ? s( (points[ 0 ][ 0 ] - firstPointX) * progress + firstPointX ) : s( points[ 0 ][ 0 ]),
                    yDir ? s( (points[ 0 ][ 1 ] - firstPointY) * progress + firstPointY ) : s( points[ 0 ][ 1 ])
                );

                for (var i = 1; i < points.length; i++) {
                    if(xDir) pointX = this.parsePoint(i, 0, prevPoints);
                    if(yDir) pointY = this.parsePoint(i, 1, prevPoints);
                    drawer.lineTo(
                        xDir ? s( (points[ i ][ 0 ] - pointX) * progress + pointX ) : s( points[ i ][ 0 ]),
                        yDir ? s( (points[ i ][ 1 ] - pointY) * progress + pointY ) : s( points[ i ][ 1 ])
                    );
                }

            }else{
                drawer.moveTo( s( points[ 0 ][ 0 ] ), s( points[ 0 ][ 1 ] ) );
                for (var i = 1; i < points.length; i++) {
                    drawer.lineTo( s( points[ i ][ 0 ] ), s( points[ i ][ 1 ] ) );
                }
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
        this.polyline.stroke( pen );
    }

} );