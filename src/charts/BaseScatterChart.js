(function(){

var BaseScatterChart = kc.BaseScatterChart = kity.createClass( 'BaseScatterChart', {
    base: kc.BaseChart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.coordinate = this.addElement( 'oxy', new kc.CategoryCoordinate() );
        var plots = this.addElement( 'plots', new kc.ScatterPlots() );
        this.setPlots( plots );

    },

    update : function( param ){
        this.callBase( param, kc.BaseScatterData );
    },

    onmousemove : function( ev ){
        var oxy = this.coordinate,
            param = oxy.param,
            oev = ev.originEvent,
            x = oev.offsetX,
            y = oev.offsetY,
            i,
            self = this,
            maxLength = 0,
            lenArr = [],
            tmpL,
            series = self.config.series;

            this.tmpCirlcle;
        
        var ele = this.getChartElementByShape( ev.targetShape );

        if( this.tmpCirlcle === ele ) return;
        this.tmpCirlcle = ele;

        if( ele instanceof kc.CircleDot ){
            self.processHover( ele );
        }

    },

    setTooltipContent : function( bind ){
        var html = '<div style="font-weight:bold">' + bind.label + '</div>';
        html += '<div>x轴: ' + bind.x + ' : y轴: ' + bind.y + '</div>';
        return html;
    },

    defaultCircleHover : function( bind ){
        this.updateTooltip( this.setTooltipContent( bind ), bind.position.x, bind.position.y );
    },

    processHover : function( ele ){
        var bind = ele.param.bind;
        var onCircleHover = this.config.interaction.onCircleHover;
        if( typeof onCircleHover == 'function' ){
            onCircleHover( bind, ele );
        }else if( onCircleHover !== null ){
            this.defaultCircleHover( bind );
        }
    }

} );


})();