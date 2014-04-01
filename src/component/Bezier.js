var Bezier = kc.Bezier = kity.createClass( "Bezier", {
    base: kc.AnimatedChartElement,
    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            x1: 0,
            y1: 0,
            x2: 100,
            y2: 0,
            width: 1,
            color: 'black'
        }, param ) );
        this.line = new kity.Bezier();
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

    draw: function ( x1, y1, x2, y2 ) {
        var sPos = new kity.BezierPoint( x1, y1 );
        var endPos = new kity.BezierPoint( x2, y2 );
        this.line.setPoints( [ sPos, endPos ] );
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