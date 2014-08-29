/**
 *
 * @class Bar
 *
 * @param {int} dir
 *        指 Bar 的方向要冲下还是冲上，-1 是冲上（默认），1 是冲下
 *
 * @param {Number} width [Animatable]
 *        指实例的宽度
 *
 * @param {Number} height [Animatable]
 *        指实例的高度
 *        animatable: true
 *
 * @param {Number} offset [Animatable]
 *        指实例的位置
 *        animatable: true
 *
 * @param {kity.Color|String} [Animatable]
 *        指实例的颜色
 *        animatable: true
 */

( function ( kity, kc ) {

    var Bar = kc.Bar = kity.createClass( "Bar", {
        base: kc.AnimatedChartElement,

        constructor: function ( param ) {
            this.callBase( kity.Utils.extend( {
                dir: -1,
                offset: 0,
                color: '#000',
                width: 10,
                height: 0,
                rotate: 0,
                label: {
                    at: 'bottom',
                    color: 'black',
                    text: null,
                }
            }, param ) );
            this.rect = new kity.Path();
            this.canvas.addShape( this.rect );
            this.addElement( 'label', new kc.Label() );
        },

        registerUpdateRules: function () {
            return kity.Utils.extend( this.callBase(), {
                draw: [ 'width', 'height', 'dir', 'offset', 'rotate' ],
                fill: [ 'color' ],
                // updateText: [ 'labelText' ]
            } );
        },

        getAnimatedParam: function () {
            return [ 'width', 'height', 'offset']; //color暂时去掉color
        },

        // updateText: function ( labelText ) {
        //     this.getElement( 'label' ).update( {
        //         text: labelText
        //     } ).setRotate( rotate );
        // },

        fill: function ( color ) {
            this.rect.fill( color );
        },

        draw: function ( width, height, dir, offset, rotate ) {

            var ww = width / 2;

            var seq = [];

            seq.push( 'M', -ww, -offset );
            seq.push( 'L', -ww, -offset + dir * height );
            seq.push( 'L',  ww, -offset + dir * height );
            seq.push( 'L',  ww, -offset );
            seq.push( 'L',  ww, -offset );
            seq.push( 'Z' );

            this.rect.setPathData( seq ).setRotate( rotate );

            this.interestPoint = {
                x: 0,
                y: dir * height
            };
        },

        getInterestPoint: function () {
            return this.canvas.getTransform().transformPoint( this.interestPoint );
        }
    } );
} )( kity, kc );