/**
 * 具有一个扇环的单点类型
 *
 * @param {String} label
 *        标签显示的文本
 *
 * @param {String} labelColor
 *        标签的颜色
 *
 * @param {String} labelPosition
 *        标签出现的位置，允许取值为：inside, left, top, right, bottom, auto
 *
 * @param {Number} pieInnerRadius
 *        半径大小
 *
 * @param {Number} pieOuterRadius
 *        扇环的大小
 *
 * @param {Number} pieAngle
 *        扇环的角度
 *
 * @param {String} pieColor
 *        扇环的颜色
 */
var Rectage = kc.Rectage = kity.createClass( "Rectage", {

    base: kc.AnimatedChartElement,

    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            x : 0,
            y : 0,
            width : 0,
            height : 0,
            color : 'rgba( 255, 255, 255, 0 )',
            
            strokeWidth : 0,
            strokeColor : '#888',

            labelText : null,
            labelColor : 'red',
            labelX : 5,
            labelY : 5

        }, param ) );

        this.rect = new kity.Rect();

        this.canvas.addShape( this.rect );
        this.label = this.addElement( 'label', new kc.Label() );
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            drawRect: [ 'width', 'height', 'color' ],
            stroke: [ 'strokeWidth', 'strokeColor' ],
            drawText: [ 'labelText', 'labelColor', 'labelX', 'labelY' ]
        } );
    },

    getAnimatedParam: function () {
        return [ 'width', 'height' ];
    },

    drawRect: function ( width, height, color ) {
        this.rect.setSize( width, height );
        this.rect.fill( color );
    },

    stroke: function ( strokeWidth, strokeColor ) {
        var pen = new kity.Pen();
        pen.setWidth( strokeWidth );
        pen.setColor( strokeColor );

        this.rect.stroke( pen );
    },

    drawText: function ( labelText, labelColor, labelX, labelY ) {

        this.label.setVisible( true );
        this.label.update( {
            text: labelText,
            color: labelColor,
            at: 'right',
            x : labelX,
            y : labelY
        } );

    },


} );