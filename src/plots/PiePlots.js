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
        var self = this;
        var list = [], series = config.series, opt = config.plotOptions,
            outer = opt.pie.outerRadius,
            inner = opt.pie.innerRadius,
            increment = opt.pie.incrementRadius
            lpos = opt.pie.labelPosition;

        for( var i = 0 ; i < series.length; i++ ){

            series[ i ].data.map(function( entry, j ){

                list.push({

                    labelText: opt.label.enabled && entry.angle > 10 ? (entry.label ? entry.label : entry.value) : null,
                    labelColor: self.getLabelColor( i == 0 ),
                    labelPosition: lpos ? lpos : i == 0 ? 'inside' : 'none',

                    connectLineWidth: 1,
                    connectLineColor: self.getEntryColor( entry ),

                    innerRadius : i == 0 ? inner : (outer  + ( i - 1 ) * increment),
                    outerRadius : outer + increment * i,
                    startAngle : entry.offsetAngle - 90,
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
            list : list,
            fx : true
        });

    }

} );


})();