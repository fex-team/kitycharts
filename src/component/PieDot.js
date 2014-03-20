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
 * @param {Number} piePercent
 *        扇环的长度，取值为 0 - 100，100 表示整个圆
 *
 * @param {String} pieBackground
 *        扇环的背景颜色
 *
 * @param {String} pieColor
 *        扇环的颜色
 */
var PieDot = kc.PieDot = kity.createClass( "PieDot", {

	base: kc.AnimatedChartElement,

	constructor: function ( param ) {
		this.callBase( kity.Utils.extend( {
			labelText: null,
			labelColor: '#62a9dd',
			labelPosition: 'inside',

			innerRadius: 0,
			outerRadius: 0,
			angle: 0,
			percent: 0,
			showPercent: true,

			background: '#ccc',
			color: '#62a9dd'
		}, param ) );

		this.bPie = new kity.Pie();
		this.fPie = new kity.Pie();

		this.canvas.addShapes( [ this.bPie, this.fPie ] );
		this.addElement( 'label', new kc.Label() );
		this.addElement( 'plabel', new kc.Label() );
	},

	registerUpdateRules: function () {
		return kity.Utils.extend( this.callBase(), {
			updatePies: [ 'innerRadius', 'outerRadius', 'angle', 'percent' ],
			updatePiesColor: [ 'color', 'background' ],
			updateLabel: [ 'labelText', 'labelColor', 'labelPosition', 'outerRadius', 'showPercent' ],
			updatePercentLabel: [ 'labelColor', 'innerRadius', 'outerRadius', 'percent', 'showPercent' ]
		} );
	},

	getAnimatedParam: function () {
		return [ 'labelColor', 'innerRadius', 'outerRadius',
			'angle', 'percent' ];
	},

	updatePiesColor: function ( color, bg ) {
		this.fPie.fill( color );
		this.bPie.fill( bg );
	},

	updatePies: function ( innerRadius, outerRadius, angle, percent ) {
		var pieLength = percent / 100;

		this.bPie.innerRadius = this.fPie.innerRadius = innerRadius;
		this.bPie.outerRadius = this.fPie.outerRadius = outerRadius;
		this.bPie.startAngle = this.fPie.startAngle = angle;


		this.bPie.pieAngle = -360 * ( 1 - pieLength );
		this.fPie.pieAngle = 360 * pieLength;

		this.bPie.draw();
		this.fPie.draw();
	},

	updateLabel: function ( labelText, labelColor, labelPosition, outerRadius, showPercent ) {
		this.getElement( 'label' ).update( {
			text: labelText,
			color: labelColor,
			at: showPercent ? 'bottom' : labelPosition,
			margin: outerRadius + 10
		} );
	},

	updatePercentLabel: function ( labelColor, innerRadius, outerRadius, percent, showPercent ) {
		var plabel = this.getElement( 'plabel' );
		plabel.setVisible( showPercent );

		if ( showPercent ) {
			var labelWidth = plabel.getSize().width;
			plabel.update( {
				at: labelWidth < innerRadius * 1.8 ? 'center' : 'top',
				color: labelColor,
				margin: outerRadius + 10,
				text: ( percent | 0 ) + '%'
			} );
		}
	}
} );