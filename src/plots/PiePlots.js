(function(){

var PiePlots = kc.PiePlots = kity.createClass( 'PiePlots', {
    base: kc.ChartElement,

    constructor: function ( config ) {
        this.callBase( config );
        this.chartType = 'pie'; // 这一行争取去掉
        this.param.config = config;
        
        this.pies = this.addElement( 'pies', new kc.ElementList() );
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            drawPies: [ 'config' ]
        } );
    },

    drawPies : function ( config ){

        var list = [], series = config.series,
            radius = 80, increment = 40;

        for( var i = 0 ; i < series.length; i++ ){

            series[ i ].data.map(function( entry, j ){

                list.push({

                    labelText: entry.angle > 10 ? entry.name : null,
                    labelColor: i == 0 ? '#FFF' : '#888',
                    labelPosition: i == 0 ? 'inside' : 'none',

                    connectLineWidth: 1,
                    connectLineColor: entry.color,

                    innerRadius : i == 0 ? 0 : (radius  + ( i - 1 ) * increment),
                    outerRadius : radius + increment * i,
                    startAngle : entry.offsetAngle - 90,
                    pieAngle: entry.angle,

                    color: entry.color,

                    x : 250,
                    y : 250

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