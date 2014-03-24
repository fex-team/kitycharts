/**
 * Marquee for chart
 * @type {[type]}
 */
var Marquee = kc.Marquee = kity.createClass( "Marquee", {
    mixins: [ kc.EventHandler ],
    constructor: function ( chart ) {
        var paper = chart.paper;
        if ( !chart.paper ) return;
        this.bind( paper );
        this.callMixin();
    },
    bind: function ( paper ) {
        var rect = new kity.Rect().setRadius( 2 ).fill( 'rgba(240,240,255, 0.3)' ).stroke( '#aaf' );
        var startPosition = null,
            currentPosition, delta, activated = false;
        var me = this;

        function start( e ) {
            if ( startPosition !== null ) return end( e );
            startPosition = kc.sharpen( e.getPosition() );
            rect.setPosition( startPosition.x, startPosition.y );
            paper.on( 'mousemove', move );
        }

        function move( e ) {
            currentPosition = e.getPosition();
            delta = kity.Vector.fromPoints( startPosition, currentPosition );
            if ( delta.length() > 10 ) {
                activated = true;
                paper.addShape( rect );
                rect.setSize( delta.x | 0, delta.y | 0 );
            }
        }

        function end( e ) {
            if ( activated ) {
                me.trigger( 'marquee', {
                    start: startPosition,
                    end: currentPosition,
                    size: {
                        width: delta.x,
                        height: delta.y
                    }
                } );
            }
            activated = false;
            startPosition = null;
            paper.removeShape( rect );
            paper.off( 'mousemove', move );
        }

        paper.on( 'mousedown', start );
        paper.on( 'mouseup', end );
    }
} );