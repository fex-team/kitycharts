/**
 * Marquee for chart
 * @type {[type]}
 */
var Marquee = kc.Marquee = kity.createClass( "Marquee", {
    constructor: function ( chart ) {
        var paper = chart.paper;
        if ( !chart.paper ) return;
        this.bind( paper );
    },
    bind: function ( paper ) {
        var rect = new kity.Rect().setRadius( 10 ).fill( 'rgba(240,240,255, 0.3)' ).stroke( '#aaf' );
        var startPosition = null;

        function start( e ) {
            if ( startPosition !== null ) return end( e );
            startPosition = e.kityEvent.getPosition();
            paper.on( 'mousemove', move );
        }

        function move( e ) {
            var currentPosition = e.kityEvent.getPosition();
            var delta = kity.Vector.fromPoints( startPosition, currentPosition );
        }

        function end( e ) {
            startPosition = null;
            paper.off( 'mousemove', move );
        }

        paper.on( 'mousedown', start );
        paper.on( 'mouseup', end );
    }
} );