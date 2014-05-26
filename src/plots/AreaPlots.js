(function(){

var AreaPlots = kc.AreaPlots = kity.createClass( 'AreaPlots', {
    base: kc.LinearPlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
        this.chartType = 'area'; // 这一行争取去掉
        
        this.addElement( 'multilines', new kc.ElementList() );
        this.addElement( 'lineDots', new kc.ElementList() );
    },

    // registerUpdateRules: function () {
    //     return kity.Utils.extend( this.callBase(), {
    //         drawPlots: [ 'coordinate', 'config' ]
    //     } );
    // },
    // update: function ( config ) {
    //     var config = config || this.config;
    //     return this.drawLines( config );
    // },

    _drawPolygon : function ( pointArr, entry, i ){
        var area = new kity.Polygon(pointArr),
            paper = this.container.paper,
            color = this._getEntryColor( entry, i ),
            fill, opacity;

        var self = this;
        if( kity.Utils.isNumber( opacity = this.config.plotOptions.area.fill.opacity ) ){
            fill = new kity.Color( color ).set( 'a', opacity );
        }else{
            fill = new kity.LinearGradientBrush().pipe( function() {
                this.addStop( 0, color );
                this.addStop( 1, color, self.config.plotOptions.area.fill.grandientStopOpacity );
                this.setStartPosition(0, 0);
                this.setEndPosition(0, 1);
                paper.addResource( this );
            })
        }

        area.fill( fill );

        this.canvas.addShape(area); 
    }

} );


})();