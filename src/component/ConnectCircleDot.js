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
var ConnectCircleDot = kc.ConnectCircleDot = kity.createClass( "ConnectCircleDot", {

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
            fxEasing: 'easeOutElastic'
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
    updateText: function ( text, position ) {
        this.getElement( 'label' ).update( {
            text: text
        } );
    },

    updateRadius: function ( radius ) {
        this.circle.setRadius( radius );
    },

    updateColor: function ( color ) {
        this.circle.fill( color );
    },
    getAnimatedParam: function () {
        return [ 'radius' ];
    },
    animate: function ( afterAnimated, duration, easing, callback ) {
        //return this.update( afterAnimated );
        if ( !this.fxEnabled() ) {
            return this.update( afterAnimated );
        }

        var canAnimated = this.getAnimatedParam(),
            beforeAnimated = this.param,
            beginParam = {},
            finishParam = {},
            staticParam = {},
            animator;
        canAnimated.push( 'x' );
        canAnimated.push( 'y' );

        for ( var p in afterAnimated ) {
            if ( p in beforeAnimated && ~canAnimated.indexOf( p ) ) {
                beginParam[ p ] = beforeAnimated[ p ];
                finishParam[ p ] = afterAnimated[ p ];
            } else {
                staticParam[ p ] = afterAnimated[ p ];
            }
        }

        this.update( staticParam );

        animator = new kity.Animator( {
            beginValue: beginParam,
            finishValue: finishParam,
            setter: function ( target, param ) {
                target.update( param );
                if ( param.x || param.y ) {
                    var cl = target.param.connectLines;
                    //console.log( target.param );
                    var Cx = param.x || target.x;
                    var Cy = param.y || target.y;
                    for ( var i = 0; i < cl.length; i++ ) {
                        if ( cl[ i ].position === 'start' ) {
                            cl[ i ].line.update( {
                                x1: Cx,
                                y1: Cy
                            } );
                        } else {
                            cl[ i ].line.update( {
                                x2: Cx,
                                y2: Cy
                            } );
                        }
                    }
                }
            }
        } );

        this.timeline = animator.start( this,
            duration || this.param.fxTiming || this.fxTiming || 500,
            easing || this.param.fxEasing || this.fxEasing || 'ease',
            callback );
        //console.log( this.param );
        return this;
    }
} );