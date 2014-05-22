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
 *
 * @param {Float} collapsed
 *        圆环的折叠率，为 0 不折叠，并且显示标签；为 1 折叠成一个半径为 2 的小圆点；大于 0 标签不显示
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
			collapsed: 0,

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
			updatePies: [ 'innerRadius', 'outerRadius', 'angle', 'percent', 'collapsed' ],
			updatePiesColor: [ 'color', 'background' ],
			updateLabel: [ 'labelText', 'labelColor', 'labelPosition', 'outerRadius', 'showPercent', 'collapsed' ],
			updatePercentLabel: [ 'labelColor', 'innerRadius', 'outerRadius', 'percent', 'showPercent', 'collapsed' ]
		} );
	},

	getAnimatedParam: function () {
		return [ 'labelColor', 'innerRadius', 'outerRadius',
			'angle', 'percent', 'collapsed' ];
	},

	updatePiesColor: function ( color, bg ) {
		this.fPie.fill( color );
		this.bPie.fill( bg );
	},

	updatePies: function ( innerRadius, outerRadius, angle, percent, collapsed ) {
		var pieLength = percent / 100,
			collapsedRadius = 3.5;

		innerRadius *= ( 1 - collapsed );
		outerRadius = collapsedRadius + ( outerRadius - collapsedRadius ) * ( 1 - collapsed );

		this.bPie.innerRadius = this.fPie.innerRadius = innerRadius;
		this.bPie.outerRadius = this.fPie.outerRadius = outerRadius;
		this.bPie.startAngle = this.fPie.startAngle = angle;


		this.bPie.pieAngle = -360 * ( 1 - pieLength );
		this.fPie.pieAngle = 360 * pieLength;

		this.bPie.draw();
		this.fPie.draw();
	},

	updateLabel: function ( labelText, labelColor, labelPosition, outerRadius, showPercent, collapsed ) {
		if ( collapsed < 1 ) {
			this.getElement( 'label' ).update( {
				visible: true,
				opacity: 1 - collapsed,
				text: labelText,
				color: labelColor,
				at: showPercent ? 'bottom' : labelPosition,
				margin: outerRadius + 10
			} );
		}
	},

	updatePercentLabel: function ( labelColor, innerRadius, outerRadius, percent, showPercent, collapsed ) {
		var plabel = this.getElement( 'plabel' );

		if ( showPercent && collapsed < 1) {
			var labelWidth = plabel.getSize().width;
			plabel.update( {
				visible: true,
				opacity: 1 - collapsed,
				at: labelWidth < innerRadius * 1.8 ? 'center' : 'top',
				color: labelColor,
				margin: outerRadius + 10,
				text: ( percent | 0 ) + '%'
			} );
		}
	}
} );