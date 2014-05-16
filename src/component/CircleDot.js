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
            color: '#62a9dd',
            radius: 0,
            fxEasing: 'easeOutElastic',
            y : 0
        }, param ) );

        this.circle = new kity.Circle();

        this.canvas.addShapes( [ this.circle ] );
        this.addElement( 'label', new kc.Label() );
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            'updateRadius': [ 'radius' ],
            'updateColor': [ 'color' ],
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

    updateColor: function ( color ) {
        this.circle.fill( color );
    },

    getAnimatedParam: function () {
        return [ 'radius', 'y' ];
    }
} );