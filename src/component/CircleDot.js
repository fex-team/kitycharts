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
var CircleDot = kc.CircleDot = kity.createClass( "CircleDot", {

    base: kc.AnimatedChartElement,

    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            label: {
                at: 'bottom',
                color: 'black',
                text: null,
            },
            strokeColor: '#FFF',
            strokeWidth: 0,
            color: '#62a9dd',
            radius: 0,
            fxEasing: 'easeOutElastic',
            x: 0,
            y: 0
        }, param ) );

        this.circle = new kity.Circle();

        this.canvas.addShapes( [ this.circle ] );
        this.addElement( 'label', new kc.Label() );
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            'updateRadius': [ 'radius' ],
            'updateStyle': [ 'color', 'strokeColor', 'strokeWidth' ],
            'updateText': [ 'labelText' ]
        } );
    },
    updateText: function ( labelText ) {
        this.getElement( 'label' ).update( {
            text: labelText
        } );
    },

    updateRadius: function ( radius ) {
        this.circle.setRadius( radius );
    },

    updateStyle: function ( color, strokeColor, strokeWidth ) {
        var pen = new kity.Pen();

        pen.setWidth( strokeWidth );
        pen.setColor( strokeColor );

        this.circle.stroke( pen );
        this.circle.fill( color );
    },
    getAnimatedParam: function () {
        return [ 'radius', 'y' ];
    }
} );