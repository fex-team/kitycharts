var RadarData = kc.RadarData = kity.createClass( 'RadarData', {
    base: kc.Data
} );
var RadarChart = kc.RadarChart = kity.createClass( 'RadarChart', {
    base: kc.Chart,
    constructor: function ( target, param ) {
        this.callBase( target, param );
        //add chart elements
        this.addElement( "net", new kc.ElementList() );
        this.addElement( "items", new kc.ElementList() );
        this.addElement( "circles", new kc.ElementList() );
        this.addElement( "labels", new kc.ElementList() );
        this.setData( new kc.RadarData() );
    },
    render: function () {
        var data = this.getData().format();
        var param = this.param;
        var colors = param.colors;
        var divide = data.categories.length;
        var delta = Math.PI * 2 / divide;
        var net = this.getElement( 'net' );
        var items = this.getElement( 'items' );
        var circles = this.getElement( 'circles' );
        var labels = this.getElement( 'labels' );
        var lineList = []; //线条数据
        var circleList = []; //点数据
        var labelList = []; //标签数据
        var container = this.container;
        var _width = container.offsetWidth;
        var _height = container.offsetHeight;
        //计算中点和半径
        var Cx = _width / 2;
        var Cy = _height / 2;
        var R = param.radius || ( _width < _height ? _width : _height ) / 2 - 50;
        var step = R / 5;
        var Angle = 0;
        //绘制罗圈
        for ( var j = 0; j < divide; j++ ) {
            for ( var i = 0; i < 6; i++ ) {
                var r = step * i;
                var item = {
                    x1: Cx + r * Math.cos( Angle ),
                    y1: Cy + r * Math.sin( Angle ),
                    x2: Cx + r * Math.cos( Angle + delta ),
                    y2: Cy + r * Math.sin( Angle + delta ),
                    color: colors.net
                };
                lineList.push( item );
            }
            var item_d = {
                x1: Cx,
                y1: Cy,
                x2: Cx + R * Math.cos( Angle ),
                y2: Cy + R * Math.sin( Angle ),
                color: colors.net
            };
            lineList.push( item_d );
            Angle += delta;
        }
        net.update( {
            elementClass: kc.Line,
            list: lineList,
            fx: false
        } );
        //绘制对象
        var itemColors = colors.items;
        var itemList = [];
        var series = data.series;
        for ( var k = 0; k < series.length; k++ ) {
            var points = [];
            var attributes = series[ k ].data;
            for ( var l = 0; l < attributes.length; l++ ) {
                var r = R * attributes[ l ];
                var _x = Cx + r * Math.cos( delta * l ),
                    _y = Cy + r * Math.sin( delta * l );
                points.push( [ _x, _y ] );
                circleList.push( {
                    radius: param.circle && param.circle.radius || 5,
                    fxEasing: param.circle && param.circle.fxEasing || 'ease',
                    color: itemColors[ k ] || '#7ecffe',
                    x: _x,
                    y: _y
                } );
            }
            var item = {
                points: points,
                color: itemColors[ k ],
                fxEasing: 'ease',
                close: true,
                fill: kity.Color.parse( itemColors[ k ] ).set( kity.Color.A, 0.3 ),
                animatedDir: 'both',
                factor: +new Date
            };
            itemList.push( item );
        }
        items.update( {
            elementClass: kc.Polyline,
            list: itemList
        } );

        if ( param.circle && param.circle.enabled ) {
            circles.update( {
                elementClass: kc.CircleDot,
                list: circleList
            } );
        }
        //绘制label
        for ( var m = 0; m < data.categories.length; m++ ) {
            var categorie = data.categories[ m ];
            var item = {
                text: categorie,
                x: Cx + ( R + 10 ) * Math.cos( delta * m ),
                y: Cy + ( R + 10 ) * Math.sin( delta * m ),
            };
            if ( item.x > Cx ) {
                item.at = 'right';
            } else if ( item.x < Cx ) {
                item.at = 'left';
            }
            labelList.push( item );
        }
        labels.update( {
            elementClass: kc.Label,
            list: labelList
        } );
    },
    update: function () {
        this.render();
    }
} );