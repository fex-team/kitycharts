/**
 * 表示标签
 * @param {string} text
 *        标签的文本
 *
 * @param {string} at
 *        标签文本的位置，是指相对于标签本身坐标的方向
 *        允许取值为：center（默认）、left、right、up、down
 *
 * @param {int} margin
 *        文本离标签坐标在指定方向上的距离
 *
 * @param {Plain} style
 *        文本的样式（CSS）
 *
 * @param {int} color
 *        文本颜色
 */
var Label = kc.Label = kity.createClass( "Label", {

    base: kc.AnimatedChartElement,

    constructor: function ( param ) {
        this.callBase( {
            text: '',
            at: 'center',
            margin: 0,
            style: {
                family: 'Arial'
            },
            color: 'black'
        } );
        this.text = new kity.Text().setStyle( {
            'font-size': 12,
            'family': 'Arial'
        } );
        this.canvas.addShape( this.text );
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            'updateText': [ 'text' ],
            'updateAnchor': [ 'at', 'margin' ],
            'updateColor': [ 'color' ],
            'updateStyle': [ 'style' ]
        } );
    },

    getAnimatedParam: function () {
        return [];
    },

    updateText: function ( text ) {
        this.text.setContent( text );
        this.updateSize();

        // 文本更新需要更新位置
        this.updateAnchor( this.param.at, this.param.margin );
    },

    updateSize: function () {
        this.size = 0;
        this.size = this.getSize();
        this.trigger( 'sizechanged' );
    },

    getSize: function () {
        return this.size || this.callBase();
    },

    updateStyle: function ( style ) {
        this.text.setStyle( style );
        this.updateSize();
        this.updateAnchor( this.param.at, this.param.margin );
    },

    updateAnchor: function ( at, margin ) {
        var hh = this.size.height / 2;
        switch ( at ) {
        case 'left':
            this.text.setTextAnchor( 'end' ).setPosition( margin, hh / 1.5 );
            break;
        case 'right':
            this.text.setTextAnchor( 'start' ).setPosition( margin, hh / 1.5 );
            break;
        case 'up':
        case 'top':
            this.text.setTextAnchor( 'center' ).setPosition( 0, hh - margin );
            break;
        case 'down':
        case 'bottom':
            this.text.setTextAnchor( 'center' ).setPosition( 0, hh + margin );
            break;
        default:
            this.text.setTextAnchor( 'center' ).setPosition( 0, hh * 0.75 );
        }
    },

    updateColor: function ( color ) {
        this.text.fill( color );
    }
} );