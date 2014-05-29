var ForceData = kc.ForceData = kity.createClass( 'ForceData', {
	base: kc.Data,
	format: function () {
		var origin = this.origin;
		var brandSet = {};
		var brandList = [];
		var connectList = [];
		var classList = [];
		var otherList = [];
		//生成List
		for ( var key in origin ) {
			var d = origin[ key ];
			//如果集合中还不存在品牌则将品牌加到集合中
			if ( d.brand === d.relatedbrand ) {
				//找到和自身class相同的项并按尺寸插入到合适的位置（降序排列）
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
					describe: d.describe,
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
		var count = 0;
		for ( var i = 0; i < connectList.length; i++ ) {
			if ( connectList[ i ].brand === connectList[ i ].relatedbrand || parseInt( connectList[ i ].relation ) === 0 ) continue;
			count++;
			var source = brandSet[ connectList[ i ].brand ];
			var target = brandSet[ connectList[ i ].relatedbrand ];
			var connects = source.connects;
			connects.push( {
				relatedbrand: target,
				relation: connectList[ i ].relation
			} );
		}
		console.log( count );
		return {
			brandSet: brandSet,
			brandList: brandList,
			classList: classList,
			connectCount: count
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
	highlightBrand: function ( e ) {
		var scatterList = this.getElement( "scatter" ).elementList;
		var cntList = this.getElement( "connects" ).elements;
		var highlightCircleList = [];
		var highlightConnectList = [];
		//设置全部节点和连线的透明度
		var setAll = function ( opaC, opaL ) {
			for ( var c = 0; c < scatterList.length; c++ ) {
				scatterList[ c ].canvas.setOpacity( opaC || 0 );
				scatterList[ c ].update( {
					stroke: 0
				} );
			}
			for ( var k in cntList ) {
				cntList[ k ].canvas.setOpacity( opaL || 0 );
				var oWidth = cntList[ k ].param.originwidth;
				cntList[ k ].update( {
					width: oWidth
				} );
			}
		};
		//寻找一个节点的全部相关节点
		var findAllRelatedCircles = function ( scatter ) {
			var relatedSet = [];
			var connects = scatter.param.connects;
			for ( var i = 0; i < connects.length; i++ ) {
				var curConnectB = connects[ i ].relatedbrand.brand;
				for ( j = 0; j < scatterList.length; j++ ) {
					var curScatter = scatterList[ j ];
					if ( curConnectB === curScatter.param.brand ) {
						relatedSet.push( curScatter );
					}
				}
			}
			return relatedSet;
		};
		//点中空白区域时直接高亮全部，返回
		if ( e === undefined ) {
			setAll( 1, 1 );
			return false;
		}
		//点中单个节点
		if ( e instanceof ChartEvent ) {
			//点击单个节点
			var circle = e.target;
			highlightCircleList.push( circle );
			var connects = circle.param.connects;
			//判断节点是否在关联的节点集合中
			highlightCircleList = highlightCircleList.concat( findAllRelatedCircles( circle ) );
			highlightConnectList = highlightConnectList.concat( circle.param.connectLines );
			setAll( 0.1 );
		} else { //点击图例
			for ( var i1 = 0; i1 < scatterList.length; i1++ ) {
				var curScatter = scatterList[ i1 ];
				//所属class
				if ( curScatter.param.brandclass === e ) {
					highlightCircleList.push( curScatter );
					highlightCircleList = highlightCircleList.concat( findAllRelatedCircles( curScatter ) );
					highlightConnectList = highlightConnectList.concat( curScatter.param.connectLines );
				}
			}
			setAll( 0.1 );
		}
		//统一处理节点和连线的高亮和非高亮
		for ( var n = 0; n < highlightCircleList.length; n++ ) {
			highlightCircleList[ n ].canvas.setOpacity( 1 );
		}
		for ( var m = 0; m < highlightConnectList.length; m++ ) {
			highlightConnectList[ m ].line.canvas.setOpacity( 1 );
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
			R -= 70;
		}
		//初始化圆的尺寸,初始化list数据
		for ( var i = 0; i < list.length; i++ ) {
			list[ i ].color = colors[ list[ i ].brandclass ];
			var circleSize = list[ i ].size;
			list[ i ].radius = 2 + Math.pow( list[ i ].size + 1, 23 / list.length );
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
		}
		//更新连线
		connects.removeElement();
		var cList = data.classList;
		for ( var n = 0; n < list.length; n++ ) {
			var source = list[ n ];
			var sourceConnects = source.connects;
			//更新所有的连线
			for ( var n1 = 0; n1 < sourceConnects.length; n1++ ) {
				var targetInfo = sourceConnects[ n1 ];
				var target = targetInfo.relatedbrand;
				var cnt;
				var cntwidth = Math.log( sourceConnects[ n1 ].relation ) / 50;
				//console.log( data.connectList.length, list.length );
				//if ( data.connectList.length < 1000 || cntwidth > 0.07 ) {
				cnt = new kc.Bezier( {
					x1: source.x,
					y1: source.y,
					x2: target.x,
					y2: target.y,
					cx: target.cx,
					cy: target.cy,
					color: source.color,
					originwidth: cntwidth,
					width: cntwidth,
					highlightwidth: ( cntwidth < 1 ? 1 : cntwidth )
				} );
				//只往画布上添加一部分的连线
				if ( data.connectCount < 300 || cntwidth > 0.07 ) {
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
				}

				//}
			}
		}
		if ( mode === 'circle' ) {
			var total = 0;
			for ( var j = 0; j < list.length; j++ ) {
				var add = list[ j ].radius;
				if ( add < 10 ) add = 10;
				total += add;
			}
			var sDelta = 0;
			for ( var j1 = 0; j1 < list.length; j1++ ) {
				if ( list[ j1 ].radius > 10 )
					sDelta += list[ j1 ].radius;
				else
					sDelta += 10;
				list[ j1 ].x = R * Math.cos( sDelta * Math.PI / total ) + Ox;
				list[ j1 ].y = R * Math.sin( sDelta * Math.PI / total ) + Oy;
				list[ j1 ].cx = R * 0.2 * Math.cos( sDelta * Math.PI / total ) + Ox;
				list[ j1 ].cy = R * 0.2 * Math.sin( sDelta * Math.PI / total ) + Oy;
				list[ j1 ].sDelta = sDelta;
				list[ j1 ].total = total;
				list[ j1 ].mode = 'circle';
				if ( list[ j1 ].radius > 10 )
					sDelta += list[ j1 ].radius;
				else
					sDelta += 10;
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
			animateDuration: 1000,
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