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
var Pie = kc.Pie = kity.createClass( "Pie", {

	base: kc.AnimatedChartElement,

	constructor: function ( param ) {
		this.callBase( kity.Utils.extend( {
			labelText: null,
			labelColor: '#62a9dd',
			labelPosition: 'inside',

			connectLineWidth: 1,
			connectLineColor: '#62a9dd',

			originAngle : 0,
			innerRadius: 0,
			outerRadius: 0,
			startAngle: 0,
			pieAngle: 0,

			strokeWidth: 1,
			strokeColor: '#FFF',

			color: '#62a9dd'
		}, param ) );

		this.pie = new kity.Pie();

		this.canvas.addShape( this.pie );
		this.label = this.addElement( 'label', new kc.Label() );
		this.connectLine = this.addElement( 'connectLine', new kc.Line() );
	},

	registerUpdateRules: function () {
		return kity.Utils.extend( this.callBase(), {
			updatePies: [ 'innerRadius', 'outerRadius', 'originAngle', 'startAngle', 'pieAngle', 'strokeWidth', 'strokeColor' ],
			updatePiesColor: [ 'color' ],
			updateLabel: [ 'labelText', 'labelColor', 'labelPosition', 'outerRadius', 'originAngle', 'startAngle', 'pieAngle' ],
			updateConnectLine: [ 'labelText', 'connectLineWidth', 'connectLineColor', 'labelPosition', 'innerRadius', 'outerRadius', 'originAngle', 'startAngle', 'pieAngle' ]
		} );
	},

	getAnimatedParam: function () {
		return [ 'startAngle', 'pieAngle' ];
	},

	updatePiesColor: function ( color ) {
		// color = kity.Color.parse( color );
		this.pie.fill( color );
	},

	updatePies: function ( innerRadius, outerRadius, originAngle, startAngle, pieAngle, strokeWidth, strokeColor ) {

		this.pie.innerRadius = innerRadius;
		this.pie.outerRadius = outerRadius;
		this.pie.startAngle = startAngle - 90 + originAngle;
		this.pie.pieAngle = pieAngle;
		this.pie.draw();
		this.pie.bringTop();
		// if(strokeWidth===0)strokeWidth=0.001;
		var pen = new kity.Pen();
		pen.setWidth( strokeWidth );
		pen.setColor( strokeColor );
		this.pie.stroke( pen );

	},

	updateLabel: function ( labelText, labelColor, labelPosition, outerRadius, originAngle, startAngle, pieAngle ) {
		if( labelPosition == 'none' ) return;

		var r = labelPosition == 'inside' ? outerRadius - 30 : outerRadius + 50;
		var a = ( startAngle + pieAngle / 2 - 90 + originAngle ) / 180 * Math.PI;

		this.label.setVisible( true );
		this.label.update( {
			text: labelText,
			color: labelColor,
			at: 'bottom',
			margin: 0,
			x: r * Math.cos( a ),
			y: r * Math.sin( a )
		} );

	},

	updateConnectLine: function ( labelText, connectLineWidth, connectLineColor, labelPosition, innerRadius, outerRadius, originAngle, startAngle, pieAngle ) {
		if ( labelPosition != 'outside' || !labelText ) return;

		var r = outerRadius + 30;
		var a = ( startAngle + pieAngle / 2 - 90 + originAngle ) / 180 * Math.PI;

		this.connectLine.update( {
			x1: ( innerRadius + 2 ) * Math.cos( a ),
			y1: ( innerRadius + 2 ) * Math.sin( a ),
			x2: r * Math.cos( a ),
			y2: r * Math.sin( a ),
			width: connectLineWidth,
			color: connectLineColor
		} );

		// this.connectLine.bringBelow();

	}

} );