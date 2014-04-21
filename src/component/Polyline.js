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
    base: kc.ChartElement,
    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            points: [
                [0, 0],
                [100, 150]
            ],
            width: 10,
            color: 'black',
            dash: null
        }, param ) );

        this.polyline = new kity.Path();
        this.canvas.addShape( this.polyline );
    },

    // getAnimatedParam: function () {
    //     return [ 'x1', 'y1', 'x2', 'y2', 'width' ];
    // },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            draw: [ 'points' ],
            stroke: [ 'color', 'width', 'dash' ]
        } );
    },

    draw: function ( points ) {
        var drawer = this.polyline.getDrawer(),
            s = kc.sharpen;

        if(points.length > 0){
            drawer.clear();
            drawer.moveTo( s( points[ 0 ][ 0 ] ), s( points[ 0 ][ 1 ] ) );
            for (var i = 1; i < points.length; i++) {
                drawer.lineTo( s( points[ i ][ 0 ] ), s( points[ i ][ 1 ] ) );
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