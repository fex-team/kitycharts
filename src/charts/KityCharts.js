(function(exports){

var KityCharts = exports.KityCharts = kc.KityCharts = kity.createClass( 'KityCharts', {
    base : kc.Chart,

    constructor: function ( target, config ) {
        this.callBase( target );

        var papers = this.container.children;
        if( papers.length > 0 ){
            var tmp = papers[ papers.length - 1 ];
            this.container.innerHTML = '';
            this.container.appendChild( tmp );
        }

        var p = $( this.container ).css('position');
        if( !~(['absolute', 'relative'].indexOf( p )) ){
            $( this.container ).css('position', 'relative');
        }

        this.setData( new kc.ChartData( config ) );
        this._update( config );
        this._bindAction();
        this._addLegend();
    },

    _update : function( config ){

        // config 融合 处理

        var base = kc.ChartsConfig.init();
        var yAxisTmpl = base.yAxis;
        this.config = kity.Utils.deepExtend( base, config );


        // 读取yAxis配置
        var i, 
            yAxis =  config.yAxis,
            base, current, coordConf, tmpConf,
            oxy,
            yAxis = kity.Utils.isObject( yAxis ) ? [ yAxis ] : yAxis,
            series = config.series,
            type;

        // 遍历生成多个坐标轴
        this.linesArrayData = [];
        for( i = 0; i < this.config.yAxis.length; i++ ){

            current = this.data.format( i );
            tmpConf = kity.Utils.deepExtend( base, current );


            tmpConf = kity.Utils.copy( tmpConf );
            tmpConf.yAxis = kity.Utils.deepExtend( yAxisTmpl, yAxis[ i ] );
            
            coordConf = kc.ChartsConfig.setCoordinateConf( tmpConf, i );
            oxy = this.coordinate = this.addElement( 'oxy_' + i, new kc.CategoryCoordinate( coordConf ) );
            oxy.update();

            // 处理图表类型 series
            for( type in series[ i ] ){
                tmpConf.series = series[ i ];
                switch( type ) {
                    case 'line':
                    case 'area':
                        var lineData = this.addElement( 'LinePlots_' + i, new kc.LinePlots( oxy, tmpConf, type ) ).update();
                        lineData.series.line && lineData.series.line.length > 1 && (this.linesArrayData = this.linesArrayData.concat( lineData.series.line ) );
                        break;
                    case 'bar':
                    case 'column':
                        this.addElement( 'BarPlots_' + i, new kc.StickPlots( oxy, tmpConf, type ) ).update();
                        break;
                    default:
                        break;
                }
            }

        }

        this.hoverDots = this.addElement( 'hoverDots', new kc.ElementList() );
    },

    _bindAction : function(){
        var self = this;
        this.currentIndex = 0;
        this.circleArr = [];

        this.paper.on( 'mousemove', function (ev) {
            if( !self.config.interaction.hover.enabled ) return;

            var oxy = self.coordinate;
            if(!oxy) return;

            var param = oxy.param,
                data = self.formattedData;
            var oev = ev.originEvent;
            var x = oev.offsetX;
            var y = oev.offsetY;
            var i;
            
            var reuslt = oxy.xRuler.leanTo( x - oxy.param.margin.left, 'map' );

            var maxLength = 0;
            var lenArr = [], tmpL, lines = self.linesArrayData;
            for (i = 0; i < lines.length; i++) {
                tmpL = lines[i].positions.length;
                if( tmpL > maxLength ){
                    maxLength = tmpL;
                }
            }

            if( !reuslt || reuslt.index > maxLength ) return;

            var pX = reuslt.value + oxy.param.margin.left;

            var pY = 0;
            var index = reuslt.index, tmpPos;

            self.circleArr = [];
            for (i = 0; i < lines.length; i++) {
                tmpPos = lines[i].positions[index];
                if(tmpPos){
                    pY = tmpPos[1];
                }else{
                    pX = pY = -100;
                }

                self.circleArr.push({
                    color: '#FFF',
                    radius: 2,
                    strokeWidth : 2,
                    strokeColor : lines[i].color || self.config.color[ i ] || self.config.finalColor,
                    bind : lines[ i ].data[ index ],
                    index : index,
                    x : pX,
                    y : pY
                });
            }
            self.currentPX = pX;

            self.hoverDots.update({
                elementClass : kc.CircleDot,
                list : self.circleArr,
                fx : false
            });

            self.currentIndex = index;

            if( self.config.onCircleHover){
                var info = {
                    posX : pX,
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.margin.left,
                    marginTop : oxy.param.margin.top,
                    data : data
                };
                self.config.onCircleHover( info );
            }
        } );

        this.paper.on('click', function(ev){
            var oxy = self.coordinate;
            if(!oxy) return;

            if( self.config.onCircleClick && (ev.targetShape.lineData || Math.abs(self.currentPX - ev.originEvent.offsetX) < 10) ){
                var target = ev.targetShape,
                    index = self.currentIndex;

                var values = [], tmp;
                for( var i = 0; i < self.linesArrayData.length; i++ ){
                    tmp = self.linesArrayData[ i ];
                    values[ i ] = {
                        name : tmp.name,
                        value : tmp.data[ index ]
                    };
                }

                var info = {
                    circle : target,
                    position : target.container.host.getPosition(),
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.margin.left,
                    marginTop : oxy.param.margin.top,
                    values : values,
                    value : ev.targetShape.container.bind
                };

                if( target.lineData ){
                    info.value = target.lineData.values[ index ];
                }

                self.config.onCircleClick( info );
            }
        });
    },

    _addLegend : function(){
        var series = this.config.series,
            i, j, type, entries, entry, label, color, tmp;

        var legend = $('<div></div>').css({
            position : 'absolute',
            bottom : '0',
            left : this.config.xAxis.margin.left + 'px',
            height : '26px',
            lineHeight : '26px'
        }).appendTo( this.container );

        for ( i = 0; i < series.length; i++ ) {
            
            for( type in series[ i ] ){
                entries = series[ i ][ type ];
                
                for ( j = 0; j < entries.length; j++ ) {
                    entry = entries[ j ];

                    label = entry.name;
                    color = entry.color || this.config.color[ j ] || this.config.finalColor;

                    tmp = $('<div></div>').css({
                        marginRight : '20px',
                        display : 'inline-block'
                    }).appendTo( legend );

                    $('<div class="kitycharts-legend-color"></div>').css({
                        width : '12px',
                        height : '12px',
                        backgroundColor : color,
                        display : 'inline-block',
                        marginRight : '5px',
                        position: 'relative',
                        top: '1px'
                    }).appendTo( tmp );

                    $('<div class="kitycharts-legend-label">' + label + '</div>').css({
                        fontSize : '10px',
                        display : 'inline-block'
                    }).appendTo( tmp );

                }

            }

        }


    }

} );

KityCharts = kity.Utils.extend( KityCharts, kc );

})( window );