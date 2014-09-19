(function(){

var PiePlots = kc.PiePlots = kity.createClass( 'PiePlots', {
    base: kc.ChartElement,

    constructor: function ( config ) {
        this.callBase( config );
        this.chartType = 'pie'; // 这一行争取去掉
        this.config = config || {};
        
        this.pies = this.addElement( 'pies', new kc.ElementList() );
    },

    update: function ( config ) {
        this.config = kity.Utils.extend( this.config, config );
        this.drawPlots( this.config );
    },

    getEntryColor : function( entry ){
         return entry.color || this.config.color[ entry.index ] || this.config.finalColor;
    },

    getLabelColor : function( isCenter ){
        var opt = this.config.plotOptions,
            lpos = opt.pie.labelPosition,
            text = opt.label.text;
        
        return lpos == 'outside' ? text.color : isCenter ? '#FFF' : text.color;
    },

    drawPlots : function ( config ){
        var self = this,
            list = [],
            series = config.series,
            opt = config.plotOptions,
            param = opt.pie,
            tmpInner = 0,
            outer = param.outerRadius,
            inner = param.innerRadius,
            increment = param.incrementRadius
            lpos = param.labelPosition,
            gap = param.gap || 0,
            originAngle = param.originAngle || 0,
            animateAngle = param.animateAngle || 0;


        for( var i = 0 ; i < series.length; i++ ){

            series[ i ].data.map(function( entry, j ){
                tmpInner = i == 0 ? inner : outer  + i * (increment + gap) - increment;

                list.push({

                    labelText: opt.label.enabled && entry.angle > 10 ? (entry.label ? entry.label : entry.value) : null,
                    labelColor: self.getLabelColor( i == 0 ),
                    labelPosition: lpos ? lpos : i == 0 ? 'inside' : 'none',

                    connectLineWidth: 1,
                    connectLineColor: self.getEntryColor( entry ),

                    originAngle : originAngle,

                    innerRadius : tmpInner,
                    outerRadius : outer + (increment + gap) * i,
                    startAngle : entry.offsetAngle + animateAngle,
                    pieAngle: entry.angle,
                    
                    strokeWidth : opt.pie.stroke.width,
                    strokeColor : opt.pie.stroke.color,

                    color: self.getEntryColor( entry ),

                    x : opt.pie.center.x,
                    y : opt.pie.center.y

                });

            });

        }

        this.pies.update({
            elementClass : kc.Pie,
            common : {

            },
            list : list,
            fx : config.animation.enabled,
            animateDuration : config.animation.duration,
            fxEasing : config.animation.mode
        });

        var shadow = config.plotOptions.pie.shadow;
        if( shadow.enabled ){
            var filter = new kity.ProjectionFilter( shadow.size, shadow.x, shadow.y );
            filter.setColor( shadow.color );
            this.getPaper().addResource( filter );

            this.pies.getElementList().forEach(function(pie,i){
                // 判断透明度为0,这里需要修改，用正则表达式
                var color = list[i].color;
                if(!(color.indexOf('rgba(') == 0 && color.indexOf('0)') == color.length-2)){
                    pie.canvas.applyFilter( filter );
                }
            });

        }

    }

} );


})();