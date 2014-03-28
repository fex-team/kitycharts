var ForceData = kc.ForceData = kity.createClass( 'ForceData', {
	base: kc.Data,
	format: function () {
		var origin = this.origin;
		var brandSet = {};
		var brandList = [];
		var connectList = [];
		for ( var key in origin ) {
			var d = origin[ key ];
			if ( !brandSet[ d.brand ] ) {
				brandSet[ d.brand ] = true;
				brandList.push( {
					brand: d.brand,
					brandclass: d.brandclass,
					percent: d.percent
				} );
			}
			connectList.push( {
				brand: d.brand,
				relatedbrand: d.relatedbrand,
				relation: d.relation
			} );
		}
		return {
			brandList: brandList,
			connectlist: connectList
		};
	}
} );
var ForceChart = kc.ForceChart = kity.createClass( 'ForceChart', {
	base: kc.Chart,
	constructor: function ( target, param ) {
		this.callBase( target, param );
		this.addElement( "scatter", new kc.ElementList() );
		this.setData( new kc.ForceData() );
	},
	adjustScatter: function () {
		var scatter = this.getElement( 'scatter' );
		var data = this.data.format();
		var param = this.param;
		var colors = param.colors;
		var list = data.brandList;
		for ( var i = 0; i < list.length; i++ ) {
			list[ i ].x = Math.random() * this.getWidth();
			list[ i ].y = Math.random() * this.getHeight();
			list[ i ].color = colors[ list[ i ].brandclass ];
			list[ i ].radius = list[ i ].percent * 40;
			list[ i ].label = {
				text: list[ i ].brand,
				color: 'black',
				at: 'bottom',
			};
			list[ i ].fxEasing = 'easeOutElastic';
		}
		//debugger;
		scatter.update( {
			elementClass: kc.CircleDot,
			list: list
		} );
		setInterval(
			function () {

			}, 500
		);
	},
	update: function () {
		this.adjustScatter();
	},
	switchLayout: function () {

	},
	switchPosition: function () {

	}
} );