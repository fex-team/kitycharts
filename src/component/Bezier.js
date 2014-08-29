var Bezier = kc.Bezier = kity.createClass( "Bezier", {
    base: kc.ChartElement,
    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 0,
            cx: 0,
            cy: 0,
            width: 1,
            color: 'black',
        }, param ) );
        var p = this.param;
        this.line = new kity.Path();
        this.canvas.addShape( this.line );
    },

    getAnimatedParam: function () {
        return [ 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'width' ];
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            draw: [ 'x1', 'y1', 'x2', 'y2', 'cx', 'cy' ],
            stroke: [ 'color', 'width', 'dash' ]
        } );
    },

    draw: function ( x1, y1, x2, y2, cx, cy ) {
        if ( x1 && y1 && x2 && y2 && cx && cy ) {
            this.line.getDrawer().clear().moveTo( x1, y1 ).bezierTo( cx, cy, cx, cy, x2, y2 );
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
    }
} );