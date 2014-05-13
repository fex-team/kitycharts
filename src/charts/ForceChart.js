var ForceData = kc.ForceData = kity.createClass( 'ForceData', {
	base: kc.Data,
	format: function () {
		var origin = this.origin;
		var brandSet = {};
		var brandList = [];
		var connectList = [];
		var classList = [];
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
					percentall: d.percentall && ( d.percentall * 100 + '%' ),
					connects: []
				} );
			}
			connectList.push( {
				brand: d.brand,
				relatedbrand: d.relatedbrand,
				relation: d.relation
			} );
			if ( classList.indexOf( d.brandclass ) === -1 ) {
				classList.push( d.brandclass );
			}
		}
		for ( var i = 0; i < connectList.length; i++ ) {
			var brandId = brandSet[ connectList[ i ].brand ].id;
			var relatedbrandId = brandSet[ connectList[ i ].relatedbrand ] && brandSet[ connectList[ i ].relatedbrand ].id;
			if ( !relatedbrandId ) continue;
			var connects = brandList[ brandId ].connects;
			connects.push( {
				brand: brandId,
				relatedbrand: relatedbrandId,
				relatedbrandname: connectList[ i ].relatedbrand,
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
			brandList: brandList,
			classList: classList
		};
	}
} );
var ForceChart = kc.ForceChart = kity.createClass( 'ForceChart', {
	base: kc.Chart,
	constructor: function ( target, param ) {
		this.callBase( target, param );
		//add chart elements
		this.addElement( "connects", new kc.ElementList() );
		this.addElement( "scatter", new kc.ElementList() );
		this.addElement( 'tooltip', new kc.Tooltip( {
			background: '#f39488',
			color: 'white',
			at: 'up',
			content: '',
			padding: [ 2, 10, 2, 10 ],
			anchorSize: 4
		} ) );
		this.setData( new kc.ForceData() );
	},
	highlightBrand: function ( e ) {
		var scatter = this.getElement( "scatter" );
		var connects = this.getElement( "connects" );
		var elList = scatter.elementList;
		var cntList = connects.elements;
		var clickedbrands = [],
			clickedbrandConnects = [];
		if ( e === undefined ) {
			for ( var c = 0; c < elList.length; c++ ) {
				elList[ c ].canvas.setOpacity( 1 );
			}
			for ( var k in cntList ) {
				cntList[ k ].canvas.setOpacity( 1 );
			}
			return false;
		} else if ( typeof e === "number" ) {
			for ( var n = 0; n < elList.length; n++ ) {
				if ( parseInt( elList[ n ].param.brandclass ) === e ) {
					clickedbrands.push( elList[ n ].param );
					clickedbrandConnects = clickedbrandConnects.concat( elList[ n ].param.connectLines );
				}
			}
		} else {
			clickedbrands = [ e.target.param ];
			clickedbrandConnects = e.target.param.connectLines;
		}
		var checkrelate = function ( brand ) {
			for ( var s = 0; s < clickedbrands.length; s++ ) {
				var cnts = clickedbrands[ s ].connects;
				for ( var s1 = 0; s1 < cnts.length; s1++ ) {
					if ( brand === cnts[ s1 ].relatedbrandname ) return true;
				}
			}
			return false;
		};
		var checkclicked = function ( brand ) {
			for ( var s = 0; s < clickedbrands.length; s++ ) {
				if ( brand === clickedbrands[ s ].brand ) return true;
			}
			return false;
		};
		for ( var i = 0; i < elList.length; i++ ) {
			var b = elList[ i ].param.brand;
			if ( checkclicked( b ) || checkrelate( b ) ) {
				elList[ i ].canvas.setOpacity( 1 );
			} else {
				elList[ i ].canvas.setOpacity( 0 );
			}
		}
		//设置连线的透明度
		for ( var key in cntList ) {
			cntList[ key ].canvas.setOpacity( 0 );
		}
		for ( var j = 0; j < clickedbrandConnects.length; j++ ) {
			clickedbrandConnects[ j ].line.canvas.setOpacity( 1 );
		}
	},
	renderLegend: function () {
		var data = this.data.format();
		var target = document.getElementById( this.param.legendTarget );
		var colors = this.param.colors;
		var cList = data.classList;
		var items = [];
		for ( var i = 0; i < cList.length; i++ ) {
			var legend = '<li value="' + cList[ i ] + '"><div class="color-block" style="background:' + colors[ i ] + '"></div><span class="c-name">' + cList[ i ] + '</span><span class="c-name-highlight" style="color:' + colors[ i ] + '">' + cList[ i ] + '</span></li>';
			items.push( legend );
		}
		target.innerHTML = items.join( "" );
	},
	adjustScatter: function () {
		var mode = this.param.mode;
		var scatter = this.getElement( 'scatter' );
		var connects = this.getElement( "connects" );
		var data = this.data.format();
		var param = this.param;
		var colors = ( function () {
			var c = {};
			var cList = data.classList;
			for ( var i = 0; i < cList.length; i++ ) {
				var color = param.colors[ i ];
				c[ cList[ i ] ] = color;
			}
			return c;
		} )();
		var list = data.brandList;
		var paperWidth = this.getWidth();
		var paperHeight = this.getHeight();
		var brandTop = data.brandTop;
		var lineClass, connectList = [];
		var Ox = paperWidth / 2;
		var Oy = paperHeight / 2;
		var R = ( Ox < Oy ? Ox : Oy ) - 50;
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
			list[ i ].Ox = Ox;
			list[ i ].Oy = Oy;
			list[ i ].R = R;
			list[ i ].chart = this;
		}
		//初始化布局

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
			list[ j1 ].sDelta = sDelta;
			list[ j1 ].total = total;
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
					var cnt;
					cnt = new kc.ConnectLine( {
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
	update: function ( args ) {
		for ( var key in args ) {
			this.param[ key ] = args[ key ];
		}
		this.adjustScatter();
		this.renderLegend();
	}
} );