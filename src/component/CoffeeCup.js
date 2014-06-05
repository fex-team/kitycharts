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
var CoffeeCup = kc.CoffeeCup = kity.createClass( "CoffeeCup", {

	base: kc.AnimatedChartElement,

	constructor: function ( param ) {
		this.callBase( kity.Utils.extend( {}, param ) );
		//咖啡杯的路径数据
		var cupPath = "M184.158,118c0.519-1,0.606-1.575,0.842-1.741c16.145-11.406,22.017-28.092,22.454-46.841 c0.484-20.817,0.146-41.737,0.06-62.565C207.504,4.595,206.792,3,206.405,0H49.425c-1.923,1-3.806,1.529-5.775,1.795 C19.513,5.055,4.265,31.251,13.763,53.713c5.667,13.402,15.804,21.458,30.418,23.689c1.966,0.3,5.022,1.589,5.423,2.96 C53.962,95.245,60.549,109,74.142,118H0c0.696,5,2.934,7.513,7.985,6.847c6.871-0.906,13.14,0.395,18.539,5.164 c1.049,0.927,3.08,0.987,4.658,0.988c62.818,0.048,125.637,0.028,188.455-0.025c1.751-0.001,3.8-0.201,5.203-1.098 c6.733-4.303,14.007-5.675,21.859-4.731c5.234,0.629,7.416-2.145,8.657-7.145H184.158z M48,68.811 c-14,1.584-28.313-12.144-28.832-27.518C18.583,23.984,32,9.46,48,10.169V68.811z";
		this.callBase( kity.Utils.extend( {}, param ) );
		this.cup = new kity.Path();
		this.cup.setPathData( cupPath ).fill( 'black' );
		this.canvas.addShape( this.cup );
		this.name = new kity.Text().setTextAnchor( 'middle' ).translate( 128, 160 );
		this.canvas.addShape( this.name );
		this.stack = new kity.Group();
		this.canvas.addShape( this.stack.translate( 54, 6 ) );
		var clipPath = "M123.893,104.331c0.478-0.884,0.558-1.392,0.775-1.539c14.871-10.084,20.279-24.838,20.681-41.415 c0.446-18.406,0.135-36.902,0.055-55.317c-0.009-1.997-0.665-3.407-1.02-6.06H0.097L0,71.053 c4.014,13.159,10.043,25.321,22.562,33.278";
		var innerPath = new kity.Path().translate( 2, 0 ).setPathData( clipPath );
		this.inner = new kity.Clip();
		this.inner.addShape( innerPath );
		this.ripple = new kity.Path();
		this.on( 'mouseover', function ( e ) {
			console.log( e );
			this.canvas.addShape( this.ripple );
			var d = this.ripple.getDrawer();
			var stacktop = this.stacktop;
			var fill = stacktop.getAttr( 'fill' );
			this.ripple.fill( fill );
			//console.log( 111 );
			// var animate = function () {       
			// 	requestAnimationFrame( animate );
			// };
			// animate();
			//d.clear().moveTo( 54, 0 ).bezierTo( 79, 79, 79, 79, 148 + 54, 0 );
		} );
		this.on( 'mouseout', function ( e ) {
			console.log( '22222' );
			//this.ripple.remove();
		} );
	},
	registerUpdateRules: function () {
		return kity.Utils.extend( this.callBase(), {
			'updateAll': [ 'name', 'constituent', 'colors', 'chart' ]
		} );
	},
	updateAll: function ( name, constituent, colors, chart ) {
		chart.paper.addResource( this.inner );
		this.name.setContent( name );
		var stack = this.stack.clear();
		var deep = 105,
			width = 148;
		var count = 0;
		var totalpercent = 0;
		var height, color, t;
		for ( var i = 0; i <= constituent.length; i++ ) {
			if ( i === constituent.length ) {
				if ( totalpercent === 1 ) {
					break;
				} else {
					height = 110 - count;
					color = 'white';
					t = null;
				}
			} else {
				var con = constituent[ i ];
				totalpercent += con.percent;
				height = deep * con.percent;
				color = colors[ con.name ];
				t = new kity.Text( con.name ).setTextAnchor( 'middle' );
			}
			var transY = deep - height - count;
			var s = new kity.Rect().setWidth( width ).setHeight( height ).translate( 0, transY ).fill( color );
			stack.addShape( s );
			if ( i === 0 ) {
				this.stacktop = s; //记录最顶端的那个
			}
			if ( t ) {
				stack.addShape( t );
				t.translate( 74, transY + height / 2 + t.getHeight() / 2 )
			}
			count += height;
		}
		//console.log( stack.clipWith );
		stack.clipWith( this.inner );
	},
	getAnimatedParam: function () {
		return [ 'x', 'y' ];
	}
} );