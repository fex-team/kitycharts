//参数格式
// {
//             label: {
//                 at: 'bottom',
//                 color: 'black',
//                 text: null,
//             },
//             color: '#62a9dd',
//             radius: 0,
//             fxEasing: 'easeOutElastic'
// }
var TransformBubble = kc.TransformBubble = kity.createClass( "TransformBubble", {

    base: kc.AnimatedChartElement,

    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            shape: 'circle',
            strokeColor: '#FFF',
            strokeWidth: 0,
            color: '#62a9dd',
            radius: 0,
            x: 0,
            y: 0
        }, param ) );
        var selfparam = this.param;
        this.on( 'click', function ( e ) {
            var chart = e.target.container.container;
            chart.addTooltip( e );
        } );
    },
    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            'updateShape': [ 'shape', 'color', 'strokeColor', 'strokeWidth' ],
            'updateRadius': [ 'radius' ],
            'updateRect': [ 'width', 'height' ],
            'updatePoints': [ 'points' ]
        } );
    },
    updateShape: function ( shape, color, strokeColor, strokeWidth ) { //更新形状
        if ( this.shape ) {
            this.shape.remove();
        }
        switch ( shape ) {
        case 'circle':
            this.shape = new kity.Circle();
            this.canvas.addShapes( [ this.shape ] );
            break;
        case 'col':
            this.shape = new kity.Rect();
            this.canvas.addShapes( [ this.shape ] );
            break;
        case 'line':
            this.shape = new kity.Polyline();
            this.canvas.addShapes( [ this.shape ] );
            break;
        default:
            break;
        }
        var pen = new kity.Pen();

        pen.setWidth( strokeWidth );
        pen.setColor( strokeColor );

        this.shape.stroke( pen );
        this.shape.fill( color );
    },
    updateRadius: function ( radius ) {
        if ( !this.shape || !this.shape.setRadius ) return false;
        this.shape.setRadius( radius );
    },
    updateRect: function ( width, height ) {
        this.shape.setWidth( width ).setHeight( height );
    },
    updatePoints: function ( points ) {
        var items = [];
        for ( var i = 0; i < points.length; i++ ) {
            var item = points[ i ];
            items.push( new kity.Point( item.x, item.y ) );
        }
        this.shape.setPoints( items );
    },
    getAnimatedParam: function () {
        return [ 'radius', 'x', 'y' ];
    }
} );