/**
 * 在一个序列上渲染文字
 *
 * @param {String} at
 *        序列方向，支持 'left'|'bottom'
 *
 * @param {Array} rules
 *        刻度位置，由小到大排序
 *
 * @param {Array} labels
 *        刻度文本，要求和 rules 有同样的长度，一一对应
 *
 * @param {String} color
 *        文字颜色
 */
var Categories = kc.Categories = kity.createClass( 'Categories', {

	base: kc.ChartElement,

	constructor: function ( param ) {
		this.callBase( kity.Utils.extend( {
			at: 'bottom',
			rules: [],
			labels: [],
			color: 'black',
			margin: 10,
			step: 1,
			rotate: 0
		}, param ) );

		this.addElement( 'labels', new kc.ElementList( {
			elementClass: kc.Label
		} ) );
	},

	registerUpdateRules: function () {
		return kity.Utils.extend( this.callBase(), {
			'updateCategories': [ 'rules', 'labels', 'at', 'margin', 'rotate', 'step' ],
			'updateColor': 'color',
			'updateCommon': 'common'
		} );
	},

	updateCategories: function ( rules, labels, at, margin, rotate, step ) {
		var i, rule, x, y, list=[];

		// step == 0 不绘制
		for (i = 0; i < rules.length; i += step) {
			rule = rules[i];
			if ( at == 'left' ) {
				x = -margin;
				y = rule;
			} else if ( at == 'bottom' ) {
				x = rule;
				y = margin;
			} 

			list.push({
				x: x,
				y: y,
				at: at,
				rotate: rotate,
				text: labels[ i ]
			});
		}

		this.getElement( 'labels' ).update( {
			list: list,
			fx: true
		} );
	},

	updateColor: function ( color ) {
		this.getElement( 'labels' ).update( {
			common: {
				color: color
			}
		} );
	}
} );