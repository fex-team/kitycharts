var ForceData = kc.ForceData = kity.createClass( 'ForceData', {
	base: kc.Data,
	format: function () {
		var origin = this.origin;
		var brandSet = {};
		var brandList = [];
		var connectList = [];
		var classList = [];
		//生成List
		for ( var key in origin ) {
			var d = origin[ key ];
			//如果集合中还不存在品牌则将品牌加到集合中
			if ( d.brand === d.relatedbrand ) {
				//找到和自身class相同的项并插入到该位置
				for ( var index = 0; index < brandList.length; index++ ) {
					if ( brandList[ index ].brandclass === d.brandclass ) break;
				}
				while ( brandList[ index ] && ( brandList[ index ].brandclass === d.brandclass ) && ( parseInt( brandList[ index ].size ) > parseInt( d.relation ) ) ) {
					index++;
				}
				brandList.splice( index, 0, {
					brand: d.brand,
					brandclass: d.brandclass,
					percent: d.percent,
					percentall: d.percentall,
					size: d.relation,
					connects: [] //初始化记录联系的数组
				} );
				brandSet[ d.brand ] = brandList[ index ];
			}
			//记录数据中的相互关联项
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
			if ( connectList[ i ].brand === connectList[ i ].relatedbrand || parseInt( connectList[ i ].relation ) === 0 ) continue;
			var source = brandSet[ connectList[ i ].brand ];
			var target = brandSet[ connectList[ i ].relatedbrand ];
			var connects = source.connects;
			connects.push( {
				relatedbrand: target,
				relation: connectList[ i ].relation
			} );
		}
		return {
			brandSet: brandSet,
			brandList: brandList,
			classList: classList
		};
	}
} );
var ForceChart = kc.ForceChart = kity.createClass( 'ForceChart', {
	base: kc.Chart,
	constructor: function ( target, param ) {
		var me = this;
		this.callBase( target, param );
		//add chart elements
		this.addElement( "connects", new kc.ElementList() );
		this.addElement( "scatter", new kc.ElementList() );
		this.setData( new kc.ForceData() );
		this.canvas.container.on( "click", function ( e ) {
			if ( e.targetShape === me.canvas.container ) {
				me.highlightBrand();
			}
		} );
	},
	// highlightBrand: function ( e ) {
	// 	var scatter = this.getElement( "scatter" );
	// 	var connects = this.getElement( "connects" );
	// 	var elList = scatter.elementList;
	// 	var cntList = connects.elements;
	// 	var clickedbrands = [],
	// 		clickedbrandConnects = [];
	// 	if ( e === undefined ) {
	// 		for ( var c = 0; c < elList.length; c++ ) {
	// 			elList[ c ].canvas.setOpacity( 1 );
	// 			elList[ c ].update( {
	// 				stroke: 0
	// 			} );
	// 		}
	// 		for ( var k in cntList ) {
	// 			cntList[ k ].canvas.setOpacity( 1 );
	// 			var oWidth = cntList[ k ].param.originwidth;
	// 			cntList[ k ].update( {
	// 				width: oWidth
	// 			} );
	// 		}
	// 		return false;
	// 	} else if ( typeof e === "number" || typeof e === "string" ) {
	// 		for ( var n = 0; n < elList.length; n++ ) {
	// 			if ( elList[ n ].param.brandclass === e || parseInt( elList[ n ].param.brandclass ) === e ) {
	// 				clickedbrands.push( elList[ n ].param );
	// 				clickedbrandConnects = clickedbrandConnects.concat( elList[ n ].param.connectLines );
	// 			}
	// 		}
	// 	} else {
	// 		clickedbrands = [ e.target.param ];
	// 		clickedbrandConnects = e.target.param.connectLines;
	// 	}
	// 	var checkrelate = function ( brand ) {
	// 		for ( var s = 0; s < clickedbrands.length; s++ ) {
	// 			var cnts = clickedbrands[ s ].connects;
	// 			for ( var s1 = 0; s1 < cnts.length; s1++ ) {
	// 				if ( brand === cnts[ s1 ].relatedbrand.brand ) return true;
	// 			}
	// 		}
	// 		return false;
	// 	};
	// 	var checkclicked = function ( brand ) {
	// 		for ( var s = 0; s < clickedbrands.length; s++ ) {
	// 			if ( brand === clickedbrands[ s ].brand ) return true;
	// 		}
	// 		return false;
	// 	};
	// 	for ( var i = 0; i < elList.length; i++ ) {
	// 		var b = elList[ i ].param.brand;
	// 		if ( checkclicked( b ) ) {
	// 			elList[ i ].canvas.setOpacity( 1 );
	// 		} else if ( checkrelate( b ) ) {
	// 			if ( typeof e === 'number' ) {
	// 				elList[ i ].canvas.setOpacity( 0.3 );
	// 			} else {
	// 				elList[ i ].canvas.setOpacity( 1 );
	// 			}
	// 		} else {
	// 			if ( typeof e === 'number' ) {
	// 				elList[ i ].canvas.setOpacity( 0 );
	// 			} else {
	// 				elList[ i ].canvas.setOpacity( 0 );
	// 			}
	// 		}
	// 	}
	// 	//设置连线的透明度
	// 	for ( var key in cntList ) {
	// 		cntList[ key ].canvas.setOpacity( 0 );
	// 	}
	// 	for ( var j = 0; j < clickedbrandConnects.length; j++ ) {
	// 		var curLine = clickedbrandConnects[ j ].line;
	// 		curLine.canvas.setOpacity( 1 );
	// 		if ( typeof e !== 'number' )
	// 			curLine.update( {
	// 				width: curLine.param.highlightwidth
	// 			} );
	// 	}
	// },
	highlightBrand: function ( e ) {
		var scatter = this.getElement( "scatter" );
		var connects = this.getElement( "connects" );
		var highlightList = [];
		if ( e instanceof ChartEvent ) {
			//点击单个节点
			var circle = e.target;
			console.log( circle );
		} else {
			//点击图例
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
		var connects = this.getElement( 'connects' );
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
		var brandSet = data.brandSet;
		var list = data.brandList;
		var paperWidth = this.getWidth();
		var paperHeight = this.getHeight();
		var Ox = paperWidth / 2;
		var Oy = paperHeight / 2;
		var brandTop = data.brandTop;
		//计算全图半径
		var R = ( Ox < Oy ? Ox : Oy ) - 10;
		if ( mode === 'circle' ) {
			R -= 50;
		}
		//初始化圆的尺寸,初始化list数据
		for ( var i = 0; i < list.length; i++ ) {
			list[ i ].color = colors[ list[ i ].brandclass ];
			var circleSize = list[ i ].size;
			list[ i ].radius = 2 + Math.pow( list[ i ].size + 1, 0.27 );
			list[ i ].label = {
				text: list[ i ].brand,
				color: 'black'
			};
			list[ i ].connectLines = [];
			list[ i ].fxEasing = null;
			list[ i ].mode = mode;
			list[ i ].Ox = Ox;
			list[ i ].Oy = Oy;
			list[ i ].R = R;
			list[ i ].chart = this;
			list[ i ].fontSize = 20;
		}
		//更新连线
		connects.removeElement();
		for ( var n = 0; n < list.length; n++ ) {
			var source = list[ n ];
			var sourceConnects = source.connects;
			//更新所有的连线
			for ( var n1 = 0; n1 < sourceConnects.length; n1++ ) {
				var targetInfo = sourceConnects[ n1 ];
				var target = targetInfo.relatedbrand;
				//if ( parseFloat( sourceConnects[ n1 ].relation ) > 0 ) {
				var cnt;
				cnt = new kc.Bezier( {
					x1: source.x,
					y1: source.y,
					x2: target.x,
					y2: target.y,
					cx: target.cx,
					cy: target.cy,
					color: source.color,
					originwidth: sourceConnects[ n1 ].relation / 300,
					width: sourceConnects[ n1 ].relation / 300,
					highlightwidth: ( sourceConnects[ n1 ].relation / 150 < 0.5 ? 0.5 : sourceConnects[ n1 ].relation / 150 )
				} );
				connects.addElement(
					'cnt' + n + n1, cnt
				);
				source.connectLines.push( {
					position: 'start',
					line: cnt
				} );
				target.connectLines.push( {
					position: 'end',
					line: cnt
				} );
				//}
			}
		}
		if ( mode === 'circle' ) {
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
				list[ j1 ].mode = 'circle';
				sDelta += list[ j1 ].radius;
				list[ j1 ].radius = list[ j1 ].radius / 3;
			}
		} else {
			var total = 0;
			for ( var j3 = 0; j3 < list.length; j3++ ) {
				total += list[ j3 ].radius;
			}
			var sDelta = total;
			//将所有的点随机分布在一个圆里
			for ( var j4 = 0; j4 < list.length; j4++ ) {
				sDelta += list[ j4 ].radius;
				list[ j4 ].cx = R * 0.2 * Math.cos( sDelta * Math.PI / total ) + Ox;
				list[ j4 ].cy = R * 0.2 * Math.sin( sDelta * Math.PI / total ) + Oy;
				// var P = list[ j4 ].radius * 9;
				// if ( P > ( R - list[ j4 ].radius ) ) P = R - list[ j4 ].radius;
				// list[ j4 ].x = P * Math.cos( sDelta * Math.PI / total ) + Ox;
				// list[ j4 ].y = P * Math.sin( sDelta * Math.PI / total ) + Oy;
				//循环产生随机数直到没有重叠为止
				while ( true ) {
					var P = Math.random() + list[ j4 ].radius / 70;
					P = P * R;
					if ( P > ( R - list[ j4 ].radius ) ) P = R - list[ j4 ].radius - Math.random() * R * 0.4;
					list[ j4 ].x = P * Math.cos( sDelta * Math.PI / total ) + Ox;
					list[ j4 ].y = P * Math.sin( sDelta * Math.PI / total ) + Oy;
					var noIntersect = true;
					for ( var n = 0; n < j4; n++ ) {
						var dx = list[ n ].x - list[ j4 ].x;
						var dy = list[ n ].y - list[ j4 ].y;
						var d = Math.sqrt( dx * dx + dy * dy );
						if ( d < ( list[ n ].radius + list[ j4 ].radius ) ) {
							noIntersect = false;
							break;
						}
					}
					if ( noIntersect ) break;
				}
				list[ j4 ].sDelta = sDelta;
				list[ j4 ].total = total;
				sDelta += list[ j4 ].radius;
			}
			//调整力导向的位置
			// var Vector = kity.Vector;
			// var setPos = function () {
			// 	for ( var i = 0; i < list.length; i++ ) {

			// 	}
			// };
			// setPos();
		}
		this.param.list = list;
		scatter.update( {
			elementClass: kc.ConnectCircleDot,
			list: list,
			animateDuration: 2000,
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