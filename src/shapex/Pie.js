/**
 * @build
 */

var Pie = kity.Pie = kity.createClass( "Pie", {
    base: kity.Path,
    constructor: function ( outerRadius, pieAngle, startAngle, innerRadius ) {
        this.callBase();
        this.outerRadius = outerRadius || 100;
        this.pieAngle = pieAngle || 90;
        this.startAngle = startAngle || 0;
        this.innerRadius = innerRadius || 0;
        this.draw();
    },
    draw: function () {
        var d = this.getDrawer().clear();
        var r = this.innerRadius,
            R = this.outerRadius,
            sa = this.startAngle,
            pa = this.pieAngle;

        if(pa > 0 && pa % 360 === 0) pa = 359.99;
        if(pa < 0 && pa % 360 === 0) pa = -359.99;

        var p1 = kity.Point.fromPolar( r, sa ),
            p2 = kity.Point.fromPolar( R, sa ),
            p3 = kity.Point.fromPolar( R, sa + pa % 360 ),
            p4 = kity.Point.fromPolar( r, sa + pa % 360 );
        var largeFlag = Math.abs( pa ) > 180 ? 1 : 0;
        var sweepFlag = pa > 0 ? 1 : 0;

        d.moveTo( p1.x, p1.y );
        d.lineTo( p2.x, p2.y );
        d.carcTo( R, largeFlag, sweepFlag, p3.x, p3.y );
        d.lineTo( p4.x, p4.y );
        d.carcTo( r, largeFlag, sweepFlag ? 0 : 1, p1.x, p1.y );
        d.close();
    }
} );