var Bezier = kc.Bezier = kity.createClass( "Bezier", {
    base: kc.AnimatedChartElement,
    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            cx1: 0,
            cy1: 0,
            cx2: 100,
            cy2: 0,
            vx1: 0,
            vy1: 0,
            vy2: 0,
            vx2: 0,
            width: 1,
            color: 'black',
        }, param ) );
        this.line = new kity.Bezier();
        this.canvas.addShape( this.line );
    },

    getAnimatedParam: function () {
        return [ 'x1', 'y1', 'x2', 'y2', 'width' ];
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            draw: [ 'cx1', 'cy1', 'cx2', 'cy2', 'vx1', 'vy1', 'vx2', 'vy2' ],
            stroke: [ 'color', 'width', 'dash' ]
        } );
    },

    draw: function ( cx1, cy1, cx2, cy2, vx1, vy1, vx2, vy2 ) {
        var sPos = new kity.BezierPoint( cx1, cy1 );
        var endPos = new kity.BezierPoint( cx2, cy2 );
        sPos.setVertex( vx1, vy1 );
        endPos.setVertex( vx2, vy2 );
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