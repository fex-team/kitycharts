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
		this.clockedge = new kity.Path().setPathData( circlePathData ).translate( -47, -47 );
		this.armS = new kity.Rect().setWidth( 7 ).setHeight( 30 ).translate( -4, -20 ).setRadius( 3 );
		this.armL = new kity.Rect().setWidth( 7 ).setHeight( 40 ).translate( -4, -30 ).setRadius( 3 );

		this.canvas.addShapes( [ this.clockedge, this.armL, this.armS ] );
	},

	registerUpdateRules: function () {
		return kity.Utils.extend( this.callBase(), {
			updateClockColor: [ 'color' ],
			updateArms: [ 'circle', 'target', 'total', 'duraction' ]
		} );
	},

	getAnimatedParam: function () {
		return [];
	},

	updateClockColor: function ( color ) {
		this.clockedge.fill( color );
		this.armS.fill( color );
		this.armL.fill( color );
	},
	updateArms: function ( circle, target, total, duraction ) {
		//计算长针要转几度
		var angles = 360 * target / circle;
		var armS = this.armS;
		var armL = this.armL;
		armL.fxRotate( angles, duraction || 1000 );
		armS.fxRotate( 360 * target / total, duraction || 1000 );
	}
} );