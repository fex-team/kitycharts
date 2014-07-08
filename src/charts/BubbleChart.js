var BubbleData = kc.BubbleData = kity.createClass( 'BubbleData', {
    base: kc.Data,
    format: function ( config ) {
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
            return {
                list: List
            };
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
        this.setData( new kc.BubbleData() );
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
        } );
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
        var spaceX = getSpace( maxX );
        var spaceY = getSpace( maxY );
        maxX = spaceX.base * spaceX.n;
        maxY = spaceY.base * spaceY.n;
        var chartHeight = paperHeight - padding[ 0 ] - padding[ 2 ];
        var chartWidth = paperWidth - padding[ 1 ] - padding[ 3 ];
        //更新横向刻度
        var xAxis = [ {
            x1: padding[ 3 ],
            y1: paperHeight - padding[ 2 ],
            x2: paperWidth - padding[ 1 ],
            y2: paperHeight - padding[ 2 ],
            color: 'gray'
        } ];
        for ( var x = 0; x <= spaceX.n; x++ ) {
            var y = padding[ 0 ] + chartHeight * x / spaceX.n;
            xAxis.push( {
                x1: padding[ 3 ],
                y1: y,
                x2: paperWidth - padding[ 1 ],
                y2: y,
                color: '#cecece'
            } );
        }
        gridHorizon.update( {
            elementClass: kc.Line,
            list: xAxis
        } );
        //更新纵向刻度
        var yAxis = [ {
            x1: padding[ 3 ],
            y1: padding[ 0 ],
            x2: padding[ 3 ],
            y2: paperHeight - padding[ 2 ],
            color: 'gray'
        } ];
        for ( var y = 0; y <= spaceY.n; y++ ) {
            var x = padding[ 0 ] + chartWidth * y / spaceY.n;
            yAxis.push( {
                x1: x,
                y1: padding[ 0 ],
                x2: x,
                y2: paperHeight - padding[ 2 ],
                color: '#cecece'
            } );
        }
        gridVertical.update( {
            elementClass: kc.Line,
            list: yAxis
        } );
        if ( param.mode === 'bubble' ) { //气泡模式
            //获取数据序列
            var series = list[ date ].series;
            var circlelist = [];
            for ( var i = 0; i < series.length; i++ ) {
                var item = series[ i ];
                var obj = {
                    x: padding[ 3 ] + item.x * chartWidth / maxX,
                    y: paperHeight - ( padding[ 2 ] + item.y * chartHeight / maxY ),
                    radius: Math.log( item.size ),
                    shape: 'circle',
                    color: colors[ item.type ],
                    label: {
                        at: 'bottom',
                        color: 'black',
                        text: item.label
                    }
                };
                circlelist.push( obj );
            }
            //console.log( circlelist );
            items.update( {
                elementClass: kc.TransformBubble,
                list: circlelist,
                animateDuration: param.animateInterval
            } );
        } else if ( param.mode === 'col' ) { //柱状模式

        } else { //折线图模式

        }
    },
    update: function ( args ) {
        for ( var key in args ) {
            this.param[ key ] = args[ key ];
        }
        this.renderBubble();
    }
} );