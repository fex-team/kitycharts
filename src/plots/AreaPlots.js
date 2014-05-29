(function(){

var AreaPlots = kc.AreaPlots = kity.createClass( 'AreaPlots', {

    base: kc.LinearPlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
    },

    plotsAttrsInit : function(){
        this.chartType = 'area';
    },

    getLineWidth : function(){
        return this.config.plotOptions.area.stroke.width;
    },

    areas : [],

    renderLineByData : function( line ){
            
        if( this.config.yAxis.stacked ){

            var p = this.config.yAxis.percentage;
            var offsetType = p ? 'percentageOffset' : 'offset';
            var allOffsetType = p ? 'allPercentageOffset' : 'allOffset';

            var arr1 = this.array2points( line[ offsetType ], line.offsetX || 0 );
            var arr2 = this.array2points( kity.Utils.copy( line[ allOffsetType ][ line.indexInGroup + 1 ] ), offset ).reverse();

            pointsArr = arr1.concat( arr2 );

        }else{

            pointsArr = this.array2points( line.data, line.offsetX || 0 );
            var areaPointArr = kity.Utils.copy( pointsArr );
            var oxy = this.coordinate;
            var x0 = oxy.measurePointX( 0 ),
                y0 = oxy.measurePointY( oxy.yRuler._ref.from );

            areaPointArr = areaPointArr.concat([
                [ pointsArr[ pointsArr.length-1 ][ 0 ], y0 ],
                [ x0, y0 ]
            ]);
            pointsArr = areaPointArr;
        }   

        for(var i in this.areas){
            this.canvas.removeShape( this.areas[ i ] );
        }

        var area = this.drawPolygon( pointsArr, line );
        this.areas.push( area );
    },

    drawPolygon : function ( pointArr, entry ){
        var area = new kity.Polygon(pointArr),
            paper = this.container.paper,
            color = this.getEntryColor( entry ),
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

        return area;
    }

} );


})();