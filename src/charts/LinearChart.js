(function(){

var LinearChart = kc.LinearChart = kity.createClass( 'LinearChart', {
    base: kc.BaseChart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.hoverDots = this.addElement( 'hoverDots', new kc.ElementList() );
        this.setData( new kc.ChartData( param ) );
        this.coordinate = this.addElement( 'oxy', new kc.CategoryCoordinate() );
    },

    onmousemove : function( ev ){
        var oxy = this.coordinate,
            param = oxy.param,
            oev = ev.originEvent,
            x = oev.offsetX || oev.layerX,
            y = oev.offsetY || oev.layerY,
            i,
            self = this,
            maxLength = 0,
            lenArr = [],
            tmpL,
            lines = self.config.series;
        
        if( self.isOutOfXRange( x ) ) return;

        var result = self.getXInfoByPosX( x );

        if( !lines || lines.length == 0 || !lines[0].positions ) return;

        for (i = 0; i < lines.length; i++) {
            tmpL = lines[i].positions.length;
            if( tmpL > maxLength ){
                maxLength = tmpL;
            }
        }

        if( !result || result.index > maxLength ) return;

        self.processHover( result );
    },

    onclick : function( ev ){
        var self = this;
        var oxy = this.coordinate;
        var config = self.config;
        var shape = ev.targetShape;

        if( shape instanceof kity.Circle && self.config.interaction.onCircleClick ){
            
            var index = self.currentIndex;

            var circleEle = self.getChartElementByShape( shape ),
                bind = circleEle.param.bind;
            var info = {
                data : bind.data,
                indexInCategories : index,
                indexInSeries : bind.indexInSeries,
                position : circleEle.getPosition()
            };

            self.callCircleClick( info, circleEle );
        }
    },

    callCircleClick : function( info, circle ){

        var onCircleClick = this.config.interaction.onCircleClick;
        if( typeof onCircleClick == 'function' ){
            onCircleClick( info, circle );
        }else if( onCircleClick !== null ){
            this.defaultCircleClick( info );
        }

    },

    defaultCircleClick : function( info ){
        this.updateTooltip( this.config.xAxis.categories[ info.indexInCategories ] + ' : ' + info.data, info.position.x, info.position.y );
    },

    update : function( data ){
        this.callBase( data );

        this.hoverDots.update({
            elementClass : kc.CircleDot,
            list : [],
            fx : false
        });
    },

    setCirclePosYByIndex : function( index ){
        var i, pY = 0,
            self = this,
            series = self.config.series;
        
        self.circleArr = [];
        for (i = 0; i < series.length; i++) {
            tmpPos = series[i].positions[ index ];
            if(tmpPos){
                pY = tmpPos[1];
            }else{
                pX = pY = -100;
            }

            self.circleArr.push({
                color: '#FFF',
                radius: 5,
                strokeWidth : 3,
                strokeColor : this.getEntryColor( series[i] ),
                x : self.currentPX,
                y : pY,
                bind : {
                    data : series[ i ].data[ index ],
                    indexInSeries : i,
                    indexInCategories : index
                },
            });
        }


        self.hoverDots.update({
            elementClass : kc.CircleDot,
            list : self.circleArr,
            fx : false
        });

        self.hoverDots.canvas.bringTop();
    },

    setTooltipContent : function( index ){
        var func = kity.Utils.queryPath('tooltip.content', this.config);

        if( func ){
            return func(index);
        }else{
            var series = this.config.series;
            var categories = this.config.xAxis.categories;
            var html = '<div style="font-weight:bold">' + categories[ index ] + '</div>';
            series.forEach(function( entry, i ){
                html += '<div>' + entry.name + ' : ' + entry.data[ index ] + '</div>';
            });

            return html;
        }
    },

    defaultHover : function( circles ){
        var index = circles[ 0 ].bind.indexInCategories;
        var series = this.config.series;
        var posArr = [];
        var posX = 0;
        var tmp;
        for( var i = 0; i < series.length; i++ ){
            tmp = series[i].positions[ index ];
            posX = tmp[ 0 ];
            posArr.push( tmp[ 1 ] );
        }
        var min = Math.min.apply([], posArr);
        var max = Math.max.apply([], posArr);

        this.updateTooltip( this.setTooltipContent( index ), posX, ( min + max ) / 2 );
    },

    callCircleHover : function(){

        var binds = [];

        this.circleArr.forEach(function( dot, i ){
            binds.push( dot );
        });

        var onHover = this.config.interaction.onHover;
        if( typeof onHover == 'function' ){
            onHover( binds );
        }else if( onHover !== null ){
            this.defaultHover( binds );
        }

    },

    processHover : function( xInfo ){

        if( !this.config.interaction.hover.enabled ) return;

    	var self = this;
        var pX = xInfo.posX + this.coordinate.param.margin.left;
        var index = xInfo.index;
        self.currentPX = pX;
        if( index == self.currentIndex ){
            return;
        }
        self.currentIndex = index;
        self.setCirclePosYByIndex( index );
        self.callCircleHover();

    }

} );


})();