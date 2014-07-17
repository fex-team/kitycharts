var BubbleData = kc.BubbleData = kity.createClass( 'BubbleData', {
    base: kc.Data,
    format: function ( config, mode ) {
        var origin = this.origin;
        if ( config === undefined ) {
            return origin;
        } else {
            var list = origin.list,
                List = [];
            for ( var i = 0; i < list.length; i++ ) {
                var item = list[ i ],
                    obj = {
                        date: item.date,
                        series: []
                    };
                for ( var j = 0; j < item.series.length; j++ ) {
                    var series = obj.series;
                    var S = item.series[ j ];
                    var o = {};
                    for ( var key in config ) {
                        o[ key ] = S[ config[ key ] ];
                    }
                    series.push( o );
                }
                List.push( obj );
            }
            if ( mode !== 'line' ) {
                return {
                    list: List
                };
            } else {
                //生成国家-数据列表
                var Map = {};
                var L0 = List[ 0 ];
                var xCates = [ List[ 0 ].date ];
                //初始化列表
                for ( var i = 0; i < L0.series.length; i++ ) {
                    var label = L0.series[ i ].label;
                    Map[ label ] = [ L0.series[ i ] ];
                }
                for ( var j = 1; j < List.length; j++ ) {
                    var item = List[ j ];
                    xCates.push( List[ j ].date );
                    for ( var k = 0; k < item.series.length; k++ ) {
                        var obj = item.series[ k ];
                        Map[ obj.label ].push( obj );
                    }
                }
                return {
                    xCates: xCates,
                    list: List,
                    map: Map
                }
            }
        }
    }
} );
var BubbleChart = kc.BubbleChart = kity.createClass( 'BubbleChart', {
    base: kc.Chart,
    constructor: function ( target, param ) {
        this.callBase( target, param );
        //add chart elements
        this.addElement( "gridhorizon", new kc.ElementList() );
        this.addElement( "gridvertical", new kc.ElementList() );
        this.addElement( "items", new kc.ElementList() );
        this.addElement( "categories", new kc.ElementList() );
        this.tooltips = this.addElement( "tooltips", new kc.ElementList() );
        this.setData( new kc.BubbleData() );
        this.tooltipList = [];
    },
    addTooltip: function ( e ) {
        var target = e.target;
        var param = target.param;
        var label = param.label;
        var tooltips = this.tooltips;
        window.clearInterval( this.param.interval );
        var item = {
            content: {
                color: '#787878',
                text: label,
            },
            background: '#e9e9e9'
        };
        switch ( this.param.mode ) {
        case 'circle':
            item.x = param.x;
            item.y = param.y;
            break;
        case 'col':
            item.x = param.x;
            item.y = param.y;
            break;
        case 'line':
            item.x = param.x;
            item.y = param.y;
            break;
        default:
            break;
        }
        this.tooltipList = this.tooltipList.concat( [ item ] );
        tooltips.update( {
            elementClass: kc.Tooltip,
            list: this.tooltipList
        } );
    },
    renderBubble: function () {
        var container = this.container;
        var paperWidth = container.clientWidth;
        var paperHeight = container.clientHeight;
        var param = this.param;
        //根据配置调整相应的字段名称
        var data = this.getData().format( {
            x: param.x,
            y: param.y,
            size: param.size,
            label: param.label,
            type: param.type
        }, param.mode );
        var colors = param.colors;
        var date = param.date;
        var horizonLines = [];
        var verticalLines = [];
        var list = data.list;
        var padding = param.padding;
        //寻找特定key的最大值
        var max = function ( key ) {
            var max = 0;
            for ( var i = 0; i < list.length; i++ ) {
                var item = list[ i ];
                var series = item.series;
                for ( var j = 0; j < series.length; j++ ) {
                    if ( series[ j ][ key ] > max ) max = series[ j ][ key ];
                }
            }
            return max;
        };
        //计算数字n的数量级
        var getOom = function ( n ) {
            var oom = Math.log( n ) / Math.log( 10 );
            return Math.floor( oom );
        };
        //根据x和y的最大值绘制坐标系
        var maxX = max( 'x' );
        var maxY = max( 'y' );
        //自适应计算坐标系每刻度的长度
        var getSpace = function ( val ) {
            var oomV = getOom( val );
            var base = Math.pow( 10, oomV );
            var n = val / base;
            //计算合理的坐标分隔
            if ( n < 5 || n > 6 ) {
                base = base / 10;
                n = n * 10;
                while ( n > 6 ) {
                    n = n / 2;
                    base = base * 2;
                }
            }
            //返回每一刻度的长度和总刻度数
            return {
                base: Math.ceil( base ),
                n: Math.ceil( n )
            };
        };
        //更新坐标系
        var gridHorizon = this.getElement( 'gridhorizon' );
        var gridVertical = this.getElement( 'gridvertical' );
        var items = this.getElement( 'items' );
        var categories = this.getElement( 'categories' );
        var spaceX = getSpace( maxX );
        var spaceY = getSpace( maxY );
        maxX = spaceX.base * spaceX.n;
        maxY = spaceY.base * spaceY.n;
        var chartHeight = paperHeight - padding[ 0 ] - padding[ 2 ];
        var chartWidth = paperWidth - padding[ 1 ] - padding[ 3 ];
        var cateList = [];
        //更新横向刻度
        var xAxis = [ {
            x1: padding[ 3 ],
            y1: paperHeight - padding[ 2 ],
            x2: paperWidth - padding[ 1 ],
            y2: paperHeight - padding[ 2 ],
            color: 'gray'
        } ];
        for ( var y = 0; y < spaceY.n; y++ ) {
            var Y = padding[ 0 ] + chartHeight * y / spaceY.n;
            xAxis.push( {
                x1: padding[ 3 ],
                y1: Y,
                x2: paperWidth - padding[ 1 ],
                y2: Y,
                color: '#cecece'
            } );
            cateList.push( {
                text: spaceY.base * y,
                at: 'left',
                x: padding[ 3 ] - 10,
                y: paperHeight - padding[ 2 ] - chartHeight * y / spaceY.n
            } );
        }
        gridHorizon.update( {
            elementClass: kc.Line,
            list: xAxis
        } );
        //更新纵向刻度和坐标数据
        var yAxis = [ {
            x1: padding[ 3 ],
            y1: padding[ 0 ],
            x2: padding[ 3 ],
            y2: paperHeight - padding[ 2 ],
            color: 'gray'
        } ];
        for ( var x = 1; x <= spaceX.n; x++ ) {
            var X = padding[ 3 ] + chartWidth * x / spaceX.n;
            yAxis.push( {
                x1: X,
                y1: padding[ 0 ],
                x2: X,
                y2: paperHeight - padding[ 2 ],
                color: '#cecece'
            } );
            cateList.push( {
                x: X,
                y: paperHeight - padding[ 2 ] + 10,
                text: spaceX.base * x
            } );
        }
        gridVertical.update( {
            elementClass: kc.Line,
            list: yAxis
        } );
        categories.update( {
            elementClass: kc.Label,
            list: cateList
        } );
        var bubbleList = [];
        if ( param.mode === 'bubble' ) { //气泡模式
            //获取数据序列
            var series = list[ date ].series;
            for ( var i = 0; i < series.length; i++ ) {
                var item = series[ i ];
                var X = padding[ 3 ] + item.x * chartWidth / maxX,
                    Y = paperHeight - ( padding[ 2 ] + item.y * chartHeight / maxY );
                var obj = {
                    shape: 'circle',
                    x: X,
                    y: Y,
                    targetX: X,
                    targetY: Y,
                    radius: Math.log( item.size ),
                    color: colors[ item.type ],
                    label: item.label
                };
                bubbleList.push( obj );
            }
        } else if ( param.mode === 'col' ) { //柱状模式
            var series = list[ date ].series;
            var colWidth = chartWidth / series.length; //每一列占据的列宽
            var colList = [];
            for ( var i = 0; i < series.length; i++ ) {
                var item = series[ i ];
                var X = padding[ 3 ] + colWidth * ( i + 0.2 ),
                    Y = paperHeight - ( padding[ 2 ] + item.y * chartHeight / maxY );
                var obj = {
                    shape: 'col',
                    x: X,
                    y: Y,
                    targetX: X,
                    targetY: Y,
                    width: colWidth * 0.6,
                    height: item.y * chartHeight / maxY,
                    color: colors[ item.type ],
                    label: item.label,
                    radius: 0
                };
                bubbleList.push( obj );
            }
        } else { //折线图模式
            var xCates = data.xCates;
            var map = data.map;
            var lineSpace = chartWidth / ( xCates.length - 1 );
            for ( var key in map ) {
                var item = map[ key ];
                var points = [];
                for ( var i = 0; i < item.length; i++ ) {
                    points.push( {
                        x: padding[ 3 ] + lineSpace * i,
                        y: paperHeight - ( padding[ 2 ] + item[ i ].y * chartHeight / maxY ),
                    } );
                }
                bubbleList.push( {
                    x: 0,
                    y: 0,
                    shape: 'line',
                    points: points,
                    strokeColor: colors[ item[ 0 ].type ],
                    color: 'none',
                    strokeWidth: 2
                } );
            }
        }
        items.update( {
            elementClass: kc.TransformBubble,
            list: bubbleList,
            animateDuration: param.animateInterval
        } );
    },
    update: function ( args ) {
        for ( var key in args ) {
            this.param[ key ] = args[ key ];
        }
        this.renderBubble();
    }
} );