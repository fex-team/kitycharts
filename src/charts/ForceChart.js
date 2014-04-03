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
				brandSet[ d.brand ] = {
					id: brandList.length
				};
				brandList.push( {
					brand: d.brand,
					brandclass: d.brandclass,
					percent: d.percent,
					connects: []
				} );
			}
			connectList.push( {
				brand: d.brand,
				relatedbrand: d.relatedbrand,
				relation: d.relation
			} );
		}
		for ( var i = 0; i < connectList.length; i++ ) {
			var brandId = brandSet[ connectList[ i ].brand ].id;
			var relatedbrandId = brandSet[ connectList[ i ].relatedbrand ] && brandSet[ connectList[ i ].relatedbrand ].id;
			if ( !relatedbrandId ) continue;
			var connects = brandList[ brandId ].connects;
			connects.push( {
				brand: brandId,
				relatedbrand: relatedbrandId,
				relation: connectList[ i ].relation
			} );
		}
		var brandTop = brandList[ 0 ];
		for ( var x = 0; x < brandList.length; x++ ) {
			if ( brandList[ x ].percent > brandTop.percent ) {
				brandTop = brandList[ x ];
			}
		}
		return {
			brandTop: brandTop,
			brandList: brandList
		};
	}
} );
var ForceChart = kc.ForceChart = kity.createClass( 'ForceChart', {
	base: kc.Chart,
	constructor: function ( target, param ) {
		this.callBase( target, param );
		this.addElement( "connects", new kc.ElementList() );
		this.addElement( "scatter", new kc.ElementList() );
		this.setData( new kc.ForceData() );
	},
	adjustScatter: function ( mode ) {
		var scatter = this.getElement( 'scatter' );
		var connects = this.getElement( "connects" );
		var data = this.data.format();
		var param = this.param;
		var colors = param.colors;
		var list = data.brandList;
		var paperWidth = this.getWidth();
		var paperHeight = this.getHeight();
		var brandTop = data.brandTop;
		var lineClass, connectList = [];
		var Ox = paperWidth / 2;
		var Oy = paperHeight / 2;
		for ( var i = 0; i < list.length; i++ ) {
			list[ i ].color = colors[ list[ i ].brandclass ];
			list[ i ].radius = list[ i ].percent * 40;
			list[ i ].label = {
				text: list[ i ].brand,
				color: 'black',
				at: 'bottom',
			};
			list[ i ].connectLines = [];
			list[ i ].fxEasing = null;
			list[ i ].mode = mode;
		}
		//初始化布局
		var R = ( Ox < Oy ? Ox : Oy ) - 50;
		var total = 0;
		for ( var j = 0; j < list.length; j++ ) {
			total += list[ j ].radius;
		}
		var sDelta = 0;
		for ( var j1 = 0; j1 < list.length; j1++ ) {
			sDelta += list[ j1 ].radius;
			list[ j1 ].x = R * Math.cos( sDelta * Math.PI / total ) + Ox;
			list[ j1 ].y = R * Math.sin( sDelta * Math.PI / total ) + Oy;
			list[ j1 ].cx = R * 0.2 * Math.cos( sDelta * Math.PI / total ) + Ox;
			list[ j1 ].cy = R * 0.2 * Math.sin( sDelta * Math.PI / total ) + Oy;
			sDelta += list[ j1 ].radius;
		}

		if ( mode !== 'circle' ) {
			brandTop.x = Ox;
			brandTop.y = Oy;
		}
		if ( mode === "circle" ) {
			lineClass = kc.Bezier;
		} else {
			//取向量的模
			var mod = function ( x, y ) {
				return Math.sqrt( x * x + y * y );
			};
			//debugger;
			var setPos = function () {
				var K = 1;
				for ( var t = 0; t < 90; t++ ) {
					for ( var k = 0; k < list.length; k++ ) {
						var source = list[ k ];
						if ( source === brandTop ) continue; //固定中心
						var connects = source.connects;
						var Fx = 0,
							Fy = 0;
						for ( var k1 = 0; k1 < connects.length; k1++ ) {
							var connect = connects[ k1 ];
							var target = list[ connect.relatedbrand ];
							var fx = target.x - source.x;
							var fy = target.y - source.y;
							var m = mod( fx, fy );
							if ( m === 0 ) continue;
							fx = fx * connect.relation / m;
							fy = fy * connect.relation / m;
							Fx += fx;
							Fy += fy;
						}
						var historyX = source.x;
						var historyY = source.y;
						source.x += Fx / K;
						source.y += Fy / K;
						//防止溢出边界
						if ( source.x < source.radius ) {
							source.x = source.radius;
						}
						if ( source.x > ( paperWidth - source.radius ) ) {
							source.x = paperWidth - source.radius;
						}
						if ( source.y < source.radius ) {
							source.y = source.radius;
						}
						if ( source.y > ( paperHeight - source.radius ) ) {
							source.y = paperHeight - source.radius;
						}
						//防止重叠
						for ( var c = 0; c < list.length; c++ ) {
							if ( c !== k ) {
								var dx = list[ c ].x - source.x;
								var dy = list[ c ].y - source.y;
								var d = Math.sqrt( dx * dx + dy * dy );
								if ( d < list[ c ].radius + source.radius ) {
									source.x = historyX;
									source.y = historyY;
									break;
								}
							}
						}
					}
				}
			};
			setPos();
			lineClass = kc.ConnectLine;
		}
		connects.removeElement();
		for ( var n = 0; n < list.length; n++ ) {
			var source = list[ n ];
			var sourceConnects = source.connects;
			for ( var n1 = 0; n1 < sourceConnects.length; n1++ ) {
				var rbrand = sourceConnects[ n1 ].relatedbrand;
				if ( sourceConnects[ n1 ].relation > 0 && rbrand > n ) {
					var cnt = new kc.ConnectLine( {
						x1: source.x,
						y1: source.y,
						x2: list[ rbrand ].x,
						y2: list[ rbrand ].y,
						color: source.color,
						width: sourceConnects[ n1 ].relation / 300
					} );
					connects.addElement(
						'cnt' + n + n1, cnt
					);
					cnt.update();
					source.connectLines.push( {
						position: 'start',
						line: cnt
					} );
					list[ rbrand ].connectLines.push( {
						position: 'end',
						line: cnt
					} );
				}
			}
		}
		scatter.update( {
			elementClass: kc.ConnectCircleDot,
			list: list
		} );
	},
	update: function ( mode ) {
		this.adjustScatter( mode );
	},
	switchLayout: function () {

	},
	switchPosition: function () {

	}
} );