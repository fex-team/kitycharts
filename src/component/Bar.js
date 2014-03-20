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
                color: 'blue',
                width: 10,
                height: 0
            }, param ) );
            this.rect = new kity.Path();
            this.canvas.addShape( this.rect );
        },

        registerUpdateRules: function () {
            return kity.Utils.extend( this.callBase(), {
                draw: [ 'width', 'height', 'dir' ],
                fill: [ 'color' ]
            } );
        },

        getAnimatedParam: function () {
            return [ 'width', 'height', 'offset', 'color' ];
        },

        fill: function ( color ) {
            this.rect.fill( color );
        },

        draw: function ( width, height, dir ) {

            var ww = width / 2;

            var seq = [];

            seq.push( 'M', -ww, 0 );
            seq.push( 'L', -ww, dir * height );
            seq.push( 'L', ww, dir * height );
            seq.push( 'L', ww, 0 );
            seq.push( 'L', ww, 0 );
            seq.push( 'Z' );

            this.rect.setPathData( seq );

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