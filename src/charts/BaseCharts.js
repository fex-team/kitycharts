(function(){

var BaseChart = kc.BaseChart = kity.createClass( 'BaseChart', {

    mixins : [ kc.ConfigHandler ],

    base: kc.Chart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.config = this.param;
        this.setData( new kc.ChartData( param ) );

        this.coordinate = this.addElement( 'oxy', new kc.CategoryCoordinate() );

        this.callMixin();

        this.bindAction();
    },

    update : function( param ){

        var config = param || this.config,
            base = kc.ChartsConfig.init(),
            config = kity.Utils.deepExtend( base, config ),
            data, coordConf;

        this.setData( new kc.ChartData( config ) );

        data = this.data.format();
        this.config = kity.Utils.deepExtend( base, data );
        
        coordConf = kc.ChartsConfig.setCoordinateConf( this.config );

        this.coordinate.update( coordConf );
        this.getPlots().update( this.coordinate, this.config );

    },

    getPlots : function(){
        return this.plots;
    },

    setPlots : function( plots ){
        this.plots = plots;
    },

    bindAction : function(){
        var self = this;
        this.currentIndex = 0;
        this.circleArr = [];
        this.hoverDots = this.addElement( 'hoverDots', new kc.ElementList() );

        this.paper.on( 'mousemove', function (ev) {

            if( !self.config.interaction.hover.enabled ) return;

            var oxy = self.coordinate;
            if(!oxy) return;

            var param = oxy.param;
            var oev = ev.originEvent;
            var x = oev.offsetX;
            var y = oev.offsetY;
            var i;
            
            var ox = oxy.param.padding.left + oxy.param.margin.left;
            
            if( x - ox < oxy.param.padding.left || x - ox + oxy.param.padding.left > oxy.xRuler.map_grid[ oxy.xRuler.map_grid.length-1 ] ) return;

            var reuslt = oxy.xRuler.leanTo( x - ox , 'map' );
            reuslt.value += oxy.param.padding.left;

            var maxLength = 0;
            var lenArr = [], tmpL, lines = self.config.series;
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
                    radius: 5,
                    strokeWidth : 3,
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

            self.hoverDots.canvas.bringTop();

            self.currentIndex = index;

            if( self.config.onCircleHover){
                var info = {
                    posX : pX,
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.margin.left,
                    marginTop : oxy.param.margin.top
                };
                self.config.onCircleHover( info );
            }
            
        } );



        this.paper.on('click', function(ev){
            var oxy = self.coordinate;
            if(!oxy) return;

            var config = self.config;

            if( self.config.onCircleClick && (ev.targetShape.lineData || Math.abs(self.currentPX - ev.originEvent.offsetX) < 10) ){
                var target = ev.targetShape,
                    index = self.currentIndex;

                // var values = [], tmp;
                // for( var i = 0; i < config.series.length; i++ ){
                //     tmp = config.series[ i ];
                //     values[ i ] = {
                //         name : tmp.name,
                //         value : tmp.data[ index ]
                //     };
                // }

                var info = {
                    circle : target,
                    position : target.container.host.getPosition(),
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.margin.left,
                    marginTop : oxy.param.margin.top,
                    // values : values,
                    value : ev.targetShape.container.bind
                };

                self.config.onCircleClick( info );
            }
        });
    },

} );


})();