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

        this.setData( new kc.ChartData( config ) );

        this._update( config );
        this.bindAction();
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
        for( i = 0; i < this.config.yAxis.length; i++ ){

            current = this.data.format( i );
            tmpConf = kity.Utils.deepExtend( base, current );


            tmpConf = kity.Utils.copy( tmpConf );
            tmpConf.yAxis = kity.Utils.deepExtend( yAxisTmpl, yAxis[ i ] );
            
            coordConf = kc.ChartsConfig.setCoordinateConf( tmpConf, i );
            oxy = this.addElement( 'oxy_' + i, new kc.CategoryCoordinate( coordConf ) );
            oxy.update();

            // 处理图表类型 series
            for( type in series[ i ] ){
                tmpConf.series = series[ i ];
                switch( type ) {
                    case 'line':
                    case 'area':
                        this.addElement( 'LinePlots_' + i, new kc.LinePlots( oxy, tmpConf, type ) ).update();
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


    },


    updateCircle : function( data ){
        var l = this.circleArr && this.circleArr.length;
        if( l && l > 0 ){
            for (var i = 0; i < l; i++) {
                this.circleArr.pop().remove();
            }
        }

        this.circleArr = [];
        var i, circle, style = this.config.interaction.circle, series = data.series[ this.chartType ];
        for (var i = 0; i < series.length; i++) {
            circle = new kity.Circle(style.radius, -20, -20);
            circle.lineData = series[i];
            
            var pen = new kity.Pen();
            pen.setWidth( style.stroke.width );
            pen.setColor( style.stroke.color );

            circle.fill( series[i].color || this.config.color[i] || this.config.finalColor );
            circle.stroke( pen );

            this.circleArr.push( circle );
        }
        this.canvas.addShapes( this.circleArr );
    },

    hideCircle : function(circle){
        circle.setCenter(-100, -100);
    },

    bindAction : function(){
        var self = this;
        this.currentIndex = 0;

        this.paper.on( 'mousemove', function (ev) {
            var oxy = self.coordinate;
            if(!oxy) return;

            var param = oxy.param,
                data = self.formattedData;
            var oev = ev.originEvent;
            var x = oev.offsetX;
            var y = oev.offsetY;
            var i, l = self.circleArr.length;
            
            var reuslt = oxy.xRuler.leanTo( x - oxy.param.margin.left, 'map' );

            var maxLength = 0;
            var lenArr = [], tmpL, series = data.series.line;
            for (i = 0; i < series.length; i++) {
                tmpL = series[i].positions.length;
                if( tmpL > maxLength ){
                    maxLength = tmpL;
                }
            }

            if( !reuslt || reuslt.index > maxLength ) return;

            var pX = reuslt.value + oxy.param.margin.left;

            var pY = 0;
            var index = reuslt.index, tmpPos;

            for (i = 0; i < self.circleArr.length; i++) {
                tmpPos = series[i].positions[index];
                if(tmpPos){
                    pY = tmpPos[1];
                    self.circleArr[i].setCenter(pX, pY);
                }else{
                    self.circleArr[i].setCenter(-100, -100);
                }

            }

            // self.updateIndicatrix(pX, oxy.param.height + oxy.param.margin.top);

            self.currentIndex = index;

            if( self.param.onCircleHover){
                var info = {
                    posX : pX,
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.margin.left,
                    marginTop : oxy.param.margin.top,
                    data : data
                };
                self.param.onCircleHover( info );
            }
        } );

        this.paper.on('click', function(ev){
            var oxy = self.coordinate;
            if(!oxy) return;

            if( self.param.onCircleClick && (ev.targetShape.lineData || Math.abs(self.indicatrix.param.x1 - ev.originEvent.offsetX) < 10) ){
                var target = ev.targetShape,
                    index = self.currentIndex,
                    indicatrixParam = self.indicatrix.param;

                var info = {
                    circle : target,
                    lineData : target.lineData,
                    position : target.getCenter ? target.getCenter() : { x: indicatrixParam.x1, y: oxy.param.height/2 },
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.margin.left,
                    marginTop : oxy.param.margin.top,
                    data : self.formattedData
                };

                if( target.lineData ){
                    info.value = target.lineData.values[ index ];
                }

                self.param.onCircleClick( info );
            }
        });
    }    


} );

KityCharts = kity.Utils.extend( KityCharts, kc );

})( window );