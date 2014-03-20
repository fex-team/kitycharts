var CircleDot = kc.CircleDot = kity.createClass( "CircleDot", {

    base: kc.AnimatedChartElement,

    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            label: {
                at: 'bottom',
                color: 'black'
            },
            labelText: null,
            color: '#62a9dd',
            radius: 0,
            fxEasing: 'easeOutElastic'
        }, param ) );

        this.addElement( 'label', new kc.Label() );

        this.circle = new kity.Circle();
        this.label = new kc.Label();

        this.canvas.addShapes( [ this.circle ] );
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            'updateRadius': [ 'radius' ],
            'updateColor': [ 'color' ],
            'updateText': [ 'labelText' ]
        } );
    },

    updateText: function ( text ) {
        this.getElement('label').update({
            text: text
        });
    },

    updateRadius: function ( radius ) {
        this.circle.setRadius( radius );
    },

    updateColor: function ( color ) {
        this.circle.fill( color );
    },

    getAnimatedParam: function () {
        return [ 'radius' ];
    }
} );