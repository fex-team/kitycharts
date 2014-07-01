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
var Clock = kc.Clock = kity.createClass( "Clock", {

	base: kc.AnimatedChartElement,

	constructor: function ( param ) {
		this.callBase( kity.Utils.extend( {
			innerRadius: 0,
			outerRadius: 0,
			startAngle: 0,
			pieAngle: 0,

			strokeWidth: 1,
			strokeColor: '#FFF',

			color: 'red'
		}, param ) );
		var selfparam = this.param;

		var circlePathData = "M44.981,0.301c-17.978,0-33.575,10.174-41.362,25.075c-0.113,0.29-0.253,0.567-0.417,0.83 c-0.082,0.165-0.164,0.33-0.246,0.495c-0.031,0.079-0.059,0.159-0.094,0.236l0.143,0.068c-0.069,0.127-0.135,0.256-0.215,0.377 c-0.144,0.43-0.32,0.846-0.575,1.218c-1.429,4.859-3.168,13.391,0.487,17.97C7.996,53.202,15.635,31.68,15.635,31.68l-0.244-0.135 c5.668-10.756,16.936-18.102,29.94-18.102c18.697,0,33.853,15.157,33.853,33.853S64.028,81.15,45.331,81.15 c-9.524,0-18.123-3.939-24.275-10.269c-3.431,2.491-7.767,4.337-13.115,4.406c8.525,11.125,21.941,18.305,37.039,18.305 c25.761,0,46.645-20.884,46.645-46.645C91.626,21.185,70.742,0.301,44.981,0.301z";
		this.clockedge = new kity.Path().setPathData( circlePathData );

		this.canvas.addShape( this.clockedge );
	},

	registerUpdateRules: function () {
		return kity.Utils.extend( this.callBase(), {
			//updatePies: [ 'innerRadius', 'outerRadius', 'startAngle', 'pieAngle', 'strokeWidth', 'strokeColor' ],
			updateClockColor: [ 'color' ]
			//updateLabel: [ 'labelText', 'labelColor', 'labelPosition', 'outerRadius', 'startAngle', 'pieAngle' ],
			//updateConnectLine: [ 'labelText', 'connectLineWidth', 'connectLineColor', 'labelPosition', 'innerRadius', 'outerRadius', 'startAngle', 'pieAngle' ]
		} );
	},

	getAnimatedParam: function () {
		return [];
	},

	updateClockColor: function ( color ) {
		this.clockedge.fill( color );
	},

	// updatePies: function ( innerRadius, outerRadius, startAngle, pieAngle, strokeWidth, strokeColor ) {

	// 	this.pie.innerRadius = innerRadius;
	// 	this.pie.outerRadius = outerRadius;
	// 	this.pie.startAngle = startAngle;
	// 	this.pie.pieAngle = pieAngle;
	// 	this.pie.draw();
	// 	// this.pie.bringTop();

	// 	var pen = new kity.Pen();
	// 	pen.setWidth( strokeWidth );
	// 	pen.setColor( strokeColor );
	// 	this.pie.stroke( pen );

	// },

	// updateLabel: function ( labelText, labelColor, labelPosition, outerRadius, startAngle, pieAngle ) {
	// 	if ( labelPosition == 'none' ) return;

	// 	var r = labelPosition == 'inside' ? outerRadius - 30 : outerRadius + 50;
	// 	var a = ( startAngle + pieAngle / 2 ) / 180 * Math.PI;

	// 	this.label.setVisible( true );
	// 	this.label.update( {
	// 		text: labelText,
	// 		color: labelColor,
	// 		at: 'bottom',
	// 		margin: 0,
	// 		x: r * Math.cos( a ),
	// 		y: r * Math.sin( a )
	// 	} );

	// },

	// updateConnectLine: function ( labelText, connectLineWidth, connectLineColor, labelPosition, innerRadius, outerRadius, startAngle, pieAngle ) {
	// 	if ( labelPosition != 'outside' || !labelText ) return;

	// 	var r = outerRadius + 30;
	// 	var a = ( startAngle + pieAngle / 2 ) / 180 * Math.PI;

	// 	this.connectLine.update( {
	// 		x1: ( innerRadius + 2 ) * Math.cos( a ),
	// 		y1: ( innerRadius + 2 ) * Math.sin( a ),
	// 		x2: r * Math.cos( a ),
	// 		y2: r * Math.sin( a ),
	// 		width: connectLineWidth,
	// 		color: connectLineColor
	// 	} );

	// }

} );