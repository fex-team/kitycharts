/**
 *
 * @class Arrow
 *
 */

( function ( kity, kc ) {

    var ArrowLine = kc.ArrowLine = kity.createClass( "ArrowLine", {
        base: kc.AnimatedChartElement,

        constructor: function ( param ) {
            this.callBase( kity.Utils.extend( {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0,
                offset: 0,
                color: '#000',
                width: 10,
                label: {
                    at: 'bottom',
                    color: 'black',
                    text: null,
                },
            }, param ) );

            var arrowParam = {
                w: 0,
                h: 1,
                a: 7,
                b: 2,
                c: 3,
                d: 0,
                t: 0
            };

            this.arrow = new kity.Arrow( arrowParam );
            this.canvas.addShape( this.arrow );

            this.line = new kity.Path();
            this.canvas.addShape( this.line );

            this.addElement( 'label', new kc.Label() );
        },

        registerUpdateRules: function () {
            return kity.Utils.extend( this.callBase(), {
                draw: [ 'width', 'x1', 'y1', 'x2', 'y2' ],
                stroke: [ 'color' ],
                setArrowAngleAndPosition: [ 'x1', 'y1', 'x2', 'y2' ],
                moveOffset: [ 'offset', 'x1', 'y1', 'x2', 'y2' ],
                updateText: [ 'x1', 'y1', 'x2', 'y2' ]
            } );
        },

        updateText: function ( x1, y1, x2, y2 ) {
            //left->end

            var label = this.getElement( 'label' ),
                angle = this.getAngle( x1, y1, x2, y2 ),
                PI = Math.PI,
                sin = Math.sin,
                cos = Math.cos,
                nor = angle + PI / 2,
                off = 4;

            var at = ( angle > 0 && angle < PI ) ? 'left' : 'right';
            if ( y2 == y1 ) {
                at = 'bottom';
            }

            var ex = cos( nor ) * off,
                ey = sin( nor ) * off;

            var pos = Math.random() * 0.4 + 0.3;
            label.update( {
                at: at,
                x: ( x2 - x1 ) * pos + x1 + ex,
                y: ( y2 - y1 ) * pos + y1 + ey
            } );
        },

        moveOffset: function ( offset, x1, y1, x2, y2 ) {
            if ( offset > 0 ) {
                var angle = this.getAngle( x1, y1, x2, y2 );
                this.canvas.setTranslate( offset * Math.cos( angle + Math.PI / 2 ), offset * Math.sin( angle + Math.PI / 2 ) );
            }
        },

        getAnimatedParam: function () {
            return [ 'x1', 'y1', 'x2', 'y2' ];
        },

        stroke: function ( color ) {
            this.line.stroke( color );
        },

        draw: function ( width, x1, y1, x2, y2 ) {

            var seq = [];

            seq.push( 'M', x1, y1 );
            seq.push( 'L', x2, y2 );

            this.line.setPathData( seq ); //.setRotate( rotate );

            // this.interestPoint = {
            //     x: 0,
            //     y: dir * height
            // };
        },

        getAngle: function ( x1, y1, x2, y2 ) {
            return Math.atan2( y2 - y1, x2 - x1 );
        },

        setArrowAngleAndPosition: function ( x1, y1, x2, y2 ) {
            var angle = this.getAngle( x1, y1, x2, y2 ) / Math.PI * 180;
            this.arrow.setTranslate( x2, y2 ).setRotate( angle );

            this.arrow.fill( this.param.color );
        },

        getInterestPoint: function () {
            return this.canvas.getTransform().transformPoint( this.interestPoint );
        }

    } );
} )( kity, kc );